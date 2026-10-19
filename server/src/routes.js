import {Router} from 'express';import bcrypt from 'bcrypt';import jwt from 'jsonwebtoken';import {z} from 'zod';
import User from './models/User.js';import {tmdb} from './tmdb.js';import {slim,recommend,rank,NAMES} from './recommend.js';
const r=Router(),wrap=f=>(q,s,n)=>f(q,s,n).catch(n);
const err=(m,status=400)=>Object.assign(new Error(m),{status});
const parse=(schema,d)=>{const p=schema.safeParse(d);if(!p.success)throw err(p.error.issues[0].message);return p.data};
const prod=process.env.NODE_ENV==='production';
const setCookie=(res,u)=>res.cookie('token',jwt.sign({id:u.id},process.env.JWT_SECRET,{expiresIn:'7d'}),{httpOnly:true,secure:prod,sameSite:prod?'none':'lax',maxAge:7*864e5});
const pub=u=>({id:u.id,name:u.name,email:u.email,favoriteGenres:u.favoriteGenres,languages:u.languages,favoriteMovies:u.favoriteMovies});
const load=async q=>{try{return await User.findById(jwt.verify(q.cookies.token,process.env.JWT_SECRET).id)}catch{return null}};
const optional=wrap(async(q,_s,n)=>{q.user=await load(q);n()});
const need=wrap(async(q,_s,n)=>{q.user=await load(q);if(!q.user)throw err('Please log in',401);n()});
const mid=z.object({id:z.number().int().positive(),title:z.string().max(200),poster:z.string().nullable().optional(),rating:z.number().optional(),year:z.string().optional()});
const idOf=v=>{if(!/^\d+$/.test(v))throw err('Invalid movie id');return v};

// Auth
const creds=z.object({email:z.string().email().max(120),password:z.string().min(8,'Password must be 8+ characters').max(100)});
r.post('/auth/register',wrap(async(q,s)=>{
 const d=parse(creds.extend({name:z.string().min(1).max(60)}),q.body);
 if(await User.exists({email:d.email.toLowerCase()}))throw err('Email already registered',409);
 const u=await User.create({...d,password:await bcrypt.hash(d.password,12)});setCookie(s,u);s.status(201).json({user:pub(u)});}));
r.post('/auth/login',wrap(async(q,s)=>{
 const d=parse(creds,q.body),u=await User.findOne({email:d.email.toLowerCase()});
 if(!u||!(await bcrypt.compare(d.password,u.password)))throw err('Invalid email or password',401);
 setCookie(s,u);s.json({user:pub(u)});}));
r.post('/auth/logout',(_q,s)=>{s.clearCookie('token');s.json({ok:true})});
r.get('/auth/me',need,(q,s)=>s.json({user:pub(q.user)}));

// Movies
const list=(path,extra)=>wrap(async(q,s)=>{const page=Math.min(Math.max(+q.query.page||1,1),500);const d=await tmdb(path,{page,...extra});s.json({page:d.page,totalPages:Math.min(d.total_pages,500),results:d.results.map(slim)})});
r.get('/movies/trending',list('/trending/movie/week'));
r.get('/movies/popular',list('/movie/popular'));
r.get('/movies/top-rated',list('/movie/top_rated'));
r.get('/movies/upcoming',list('/movie/upcoming'));
r.get('/movies/search',wrap(async(q,s)=>{const query=String(q.query.q||'').trim().slice(0,100);if(!query)throw err('Search query required');
 const d=await tmdb('/search/movie',{query,page:Math.min(+q.query.page||1,500)});s.json({page:d.page,totalPages:Math.min(d.total_pages,500),results:d.results.map(slim)})}));
const SORTS=['popularity.desc','vote_average.desc','primary_release_date.desc','title.asc'];
r.get('/movies/discover',wrap(async(q,s)=>{const x=q.query,sort=SORTS.includes(x.sort)?x.sort:'popularity.desc';
 const d=await tmdb('/discover/movie',{page:Math.min(+x.page||1,500),sort_by:sort,with_genres:/^[\d,|]+$/.test(x.genre||'')?x.genre:undefined,primary_release_year:/^\d{4}$/.test(x.year||'')?x.year:undefined,'vote_average.gte':+x.rating||undefined,'vote_count.gte':sort==='vote_average.desc'?200:undefined,with_original_language:/^[a-z]{2}$/.test(x.lang||'')?x.lang:undefined});
 s.json({page:d.page,totalPages:Math.min(d.total_pages,500),results:d.results.map(slim)})}));
r.get('/movies/:id',optional,wrap(async(q,s)=>{const id=idOf(q.params.id);
 const d=await tmdb(`/movie/${id}`,{append_to_response:'videos,credits'},3600);
 if(q.user){q.user.recent=[slim(d),...q.user.recent.filter(m=>m.id!==d.id)].slice(0,30).map(m=>({id:m.id,title:m.title,poster:m.poster,rating:m.rating,year:m.year}));await q.user.save()}
 const t=d.videos?.results?.find(v=>v.site==='YouTube'&&v.type==='Trailer');
 s.json({...slim(d),originalTitle:d.original_title,tagline:d.tagline,runtime:d.runtime,genres:d.genres,trailerKey:t?.key||null,director:d.credits?.crew?.find(c=>c.job==='Director')?.name||null,cast:(d.credits?.cast||[]).slice(0,10).map(c=>({name:c.name,character:c.character}))})}));
for(const [k,path] of [['similar','similar'],['recommendations','recommendations']])
 r.get(`/movies/:id/${k}`,wrap(async(q,s)=>{const d=await tmdb(`/movie/${idOf(q.params.id)}/${path}`);s.json({results:d.results.map(slim)})}));
r.get('/movies/:id/videos',wrap(async(q,s)=>s.json(await tmdb(`/movie/${idOf(q.params.id)}/videos`,{},3600))));
r.get('/movies/:id/credits',wrap(async(q,s)=>s.json(await tmdb(`/movie/${idOf(q.params.id)}/credits`,{},3600))));

// AI recommendations (works without an AI key via the deterministic engine)
const aiIn=z.object({prompt:z.string().trim().max(500).optional(),genres:z.array(z.number()).max(5).optional(),mood:z.string().max(30).optional(),language:z.string().length(2).optional(),yearFrom:z.number().optional(),yearTo:z.number().optional(),minRating:z.number().min(0).max(10).optional(),maxRuntime:z.number().optional(),underrated:z.boolean().optional(),family:z.boolean().optional(),exclude:z.array(z.number()).max(100).optional()});
r.post('/ai/recommendations',optional,wrap(async(q,s)=>{const d=parse(aiIn,q.body);if(!d.prompt&&!d.genres?.length&&!d.mood)throw err('Describe what you feel like watching or pick a genre');s.json(await recommend(q.user,d))}));
r.post('/ai/explain',optional,wrap(async(q,s)=>{const {movieId,prompt}=parse(z.object({movieId:z.number(),prompt:z.string().max(500).optional()}),q.body);
 const m=slim(await tmdb(`/movie/${movieId}`));const {results}=await recommend(q.user,{prompt});const hit=results.find(x=>x.id===m.id);
 s.json({reason:hit?.reason||`${m.title} has ${m.rating.toFixed(1)}/10 across ${m.votes} votes; genres: ${m.genre_ids.map(g=>NAMES[g]).join(', ')}.`})}));

// Watchlist
const slimU=m=>({id:m.id,title:m.title,poster:m.poster||null,rating:m.rating,year:m.year});
r.get('/watchlist',need,(q,s)=>s.json({items:q.user.watchlist}));
r.post('/watchlist',need,wrap(async(q,s)=>{const m=parse(mid,q.body);if(!q.user.watchlist.some(x=>x.id===m.id)){if(q.user.watchlist.length>=500)throw err('Watchlist is full');q.user.watchlist.push(slimU(m));await q.user.save()}s.status(201).json({items:q.user.watchlist})}));
r.post('/watchlist/merge',need,wrap(async(q,s)=>{const {items}=parse(z.object({items:z.array(mid).max(200)}),q.body);const have=new Set(q.user.watchlist.map(x=>x.id));
 for(const m of items)if(!have.has(m.id)&&q.user.watchlist.length<500){q.user.watchlist.push(slimU(m));have.add(m.id)}await q.user.save();s.json({items:q.user.watchlist})}));
r.delete('/watchlist/:movieId',need,wrap(async(q,s)=>{q.user.watchlist=q.user.watchlist.filter(x=>x.id!==+idOf(q.params.movieId));await q.user.save();s.json({items:q.user.watchlist})}));

// Profile, feedback, personalization
r.get('/users/profile',need,(q,s)=>s.json({user:pub(q.user)}));
r.put('/users/profile',need,wrap(async(q,s)=>{const d=parse(z.object({name:z.string().min(1).max(60).optional(),favoriteGenres:z.array(z.number()).max(10).optional(),languages:z.array(z.string().length(2)).max(10).optional()}),q.body);Object.assign(q.user,d);await q.user.save();s.json({user:pub(q.user)})}));
r.post('/users/favorites',need,wrap(async(q,s)=>{const m=parse(mid,q.body);if(!q.user.favoriteMovies.some(x=>x.id===m.id)&&q.user.favoriteMovies.length<50)q.user.favoriteMovies.push(slimU(m));await q.user.save();s.status(201).json({user:pub(q.user)})}));
r.post('/users/feedback',need,wrap(async(q,s)=>{const {movieId,value}=parse(z.object({movieId:z.number(),value:z.union([z.literal(1),z.literal(-1)])}),q.body);
 const genres=slim(await tmdb(`/movie/${movieId}`)).genre_ids;q.user.feedback=[...q.user.feedback.filter(f=>f.movieId!==movieId),{movieId,value,genres}].slice(-200);await q.user.save();s.json({ok:true})}));
r.get('/users/history',need,(q,s)=>s.json({recent:q.user.recent,feedback:q.user.feedback}));
r.get('/users/recommendations',need,wrap(async(q,s)=>{const u=q.user;const g=u.favoriteGenres.length?u.favoriteGenres:[];
 const {results}=await recommend(u,{genres:g,exclude:[...u.watchlist.map(m=>m.id),...u.recent.map(m=>m.id)]});s.json({results})}));
export default r;
