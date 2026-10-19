import {tmdb} from './tmdb.js';
export const GENRES={action:28,adventure:12,animation:16,comedy:35,crime:80,documentary:99,drama:18,family:10751,fantasy:14,history:36,horror:27,music:10402,mystery:9648,romance:10749,'science fiction':878,'sci-fi':878,thriller:53,war:10752,western:37};
export const NAMES=Object.fromEntries(Object.entries(GENRES).reverse().map(([k,v])=>[v,k]));
// Mood -> genres. TMDB has no mood filter, so moods are translated to genres.
export const MOODS={'mind-bending':[878,9648,53],twist:[9648,53],emotional:[18,10749],friendship:[18,35],light:[35,10751],dark:[53,80,27],inspiring:[18,36,99],funny:[35],scary:[27],'feel-good':[35,10749,10751]};
// Weighted score, all features normalized to 0..1. Edit weights here.
export const WEIGHTS={genre:.35,mood:.15,pref:.10,rating:.25,popularity:.15};
export const slim=m=>({id:m.id,title:m.title,poster:m.poster_path,backdrop:m.backdrop_path,overview:m.overview,rating:m.vote_average||0,votes:m.vote_count||0,popularity:m.popularity||0,year:(m.release_date||'').slice(0,4),lang:m.original_language,genre_ids:m.genre_ids||m.genres?.map(g=>g.id)||[]});
const overlap=(a,set)=>a.length?a.filter(x=>set.has(x)).length/a.length:0;
export function score(m,p,u={},o={}){
 const g=new Set(m.genre_ids);
 const pop=Math.min(Math.log10(m.popularity+1)/3,1);
 return WEIGHTS.genre*overlap(p.genres,g)+WEIGHTS.mood*overlap(p.moodGenres,g)
  +WEIGHTS.pref*(.6*overlap(u.favoriteGenres||[],g)+.4*overlap(u.likedGenres||[],g))
  +WEIGHTS.rating*(m.rating/10)*Math.min(m.votes/500,1)
  +WEIGHTS.popularity*(o.underrated?1-pop:pop);
}
const jac=(a,b)=>{const A=new Set(a),n=b.filter(x=>A.has(x)).length;return n/(A.size+b.length-n||1)};
export function rank(movies,p,u={},o={}){
 const bad=new Set([...(u.dislikedIds||[]),...(o.exclude||[])]),seen=new Set();
 let pool=movies.filter(m=>m.id&&m.poster&&!bad.has(m.id)&&!seen.has(m.id)&&seen.add(m.id)).map(m=>({...m,score:score(m,p,u,o)}));
 const out=[];
 while(pool.length&&out.length<(o.limit||12)){ // greedy MMR: relevance minus similarity to picks
  let best=0,bv=-1;
  pool.forEach((m,i)=>{const v=.75*m.score-.25*Math.max(0,...out.map(x=>jac(x.genre_ids,m.genre_ids)));if(v>bv){bv=v;best=i}});
  out.push(pool.splice(best,1)[0]);
 }
 return out.map(m=>({...m,reason:reason(m,p)}));
}
function reason(m,p){
 const hit=[...new Set([...p.genres,...p.moodGenres])].filter(x=>m.genre_ids.includes(x)).map(x=>NAMES[x]);
 return `${hit.length?`Recommended for its ${hit.slice(0,3).join(', ')} elements. `:'A popular pick based on current trends. '}${m.votes>50?`Rated ${m.rating.toFixed(1)}/10 by ${m.votes.toLocaleString()} viewers.`:''}`.trim();
}
function heuristic(text,input){
 const t=text.toLowerCase(),genres=new Set((input.genres||[]).map(Number).filter(Boolean)),mood=new Set(input.mood?[input.mood]:[]);
 for(const [k,v] of Object.entries(GENRES))if(t.includes(k))genres.add(v);
 for(const k of Object.keys(MOODS))if(t.includes(k))mood.add(k);
 if(/mind.?bending/.test(t))mood.add('mind-bending');
 return {genres:[...genres],mood:[...mood],similarTo:(t.match(/similar to ([a-z0-9' :-]{2,60})/i)||[])[1]?.trim(),underrated:/underrated|hidden gem/.test(t)};
}
export async function extractPrefs(text,input){
 let p=heuristic(text,input),source='fallback';
 if(process.env.AI_API_KEY&&process.env.AI_BASE_URL&&text){
  try{
   const r=await fetch(`${process.env.AI_BASE_URL}/chat/completions`,{method:'POST',signal:AbortSignal.timeout(6000),headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.AI_API_KEY}`},
    body:JSON.stringify({model:process.env.AI_MODEL,messages:[{role:'system',content:`Return ONLY JSON {"genres":string[],"mood":string[],"similarTo":string|null,"underrated":boolean}. genres must come from: ${Object.keys(GENRES)}. mood from: ${Object.keys(MOODS)}. Never name movies except similarTo.`},{role:'user',content:text}]})});
   const j=JSON.parse((await r.json()).choices[0].message.content.replace(/```json|```/g,''));
   const ids=(j.genres||[]).map(n=>GENRES[String(n).toLowerCase()]).filter(Boolean);
   p={genres:[...new Set([...p.genres,...ids])],mood:(j.mood||[]).filter(k=>MOODS[k]),similarTo:typeof j.similarTo==='string'?j.similarTo.slice(0,60):p.similarTo,underrated:!!j.underrated||p.underrated};source='ai';
  }catch{/* provider failed: keep heuristic result */}
 }
 return {...p,source,moodGenres:[...new Set(p.mood.flatMap(k=>MOODS[k]))]};
}
export async function recommend(user,input){
 const p=await extractPrefs(input.prompt||'',input);
 if(input.family&&!p.genres.includes(10751))p.genres.push(10751);
 const under=input.underrated||p.underrated;
 const base={'vote_count.gte':under?300:100,'vote_average.gte':input.minRating||(under?7:0),sort_by:under?'vote_average.desc':'popularity.desc',with_original_language:input.language,'primary_release_date.gte':input.yearFrom?`${input.yearFrom}-01-01`:undefined,'primary_release_date.lte':input.yearTo?`${input.yearTo}-12-31`:undefined,'with_runtime.lte':input.maxRuntime};
 const genres=[...new Set([...p.genres,...(p.genres.length?[]:p.moodGenres)])];
 const calls=[1,2].map(page=>tmdb('/discover/movie',{...base,page,with_genres:genres.join('|')}));
 if(p.similarTo){const s=await tmdb('/search/movie',{query:p.similarTo});const id=s.results?.[0]?.id;if(id){calls.push(tmdb(`/movie/${id}/recommendations`),tmdb(`/movie/${id}/similar`));p.genres.push(...(s.results[0].genre_ids||[]));}}
 const cands=(await Promise.all(calls)).flatMap(d=>d.results||[]).map(slim);
 const liked=(user?.feedback||[]).filter(f=>f.value>0).flatMap(f=>f.genres);
 const u={favoriteGenres:user?.favoriteGenres,likedGenres:liked,dislikedIds:(user?.feedback||[]).filter(f=>f.value<0).map(f=>f.movieId)};
 return {source:p.source,results:rank(cands,p,u,{underrated:under,exclude:input.exclude})};
}
