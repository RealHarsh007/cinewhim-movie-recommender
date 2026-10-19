import {useEffect,useState} from 'react';import {LayoutGrid,List} from 'lucide-react';import {api,errMsg,GENRES} from '../api';import MovieCard,{Skeletons} from '../components/MovieCard';
const init={q:'',genre:'',year:'',rating:'',lang:'',sort:'popularity.desc',page:1};
export default function Discover(){const [f,setF]=useState(init),[d,setD]=useState(null),[err,setErr]=useState(''),[grid,setGrid]=useState(true);
 const set=(k,v)=>setF(p=>({...p,[k]:v,page:k==='page'?v:1}));
 useEffect(()=>{setD(null);setErr('');const c=new AbortController(),t=setTimeout(()=>api.get(f.q?'/movies/search':'/movies/discover',{params:f,signal:c.signal}).then(r=>setD(r.data)).catch(e=>!c.signal.aborted&&setErr(errMsg(e))),300);return()=>{clearTimeout(t);c.abort()}},[f]);
 const sel="bg-panel rounded-md px-3 py-2";
 return <><h1 className="text-3xl font-extrabold mb-4">Discover</h1>
  <div className="flex flex-wrap gap-2 mb-6"><input aria-label="Title" placeholder="Title" value={f.q} onChange={e=>set('q',e.target.value)} className={sel}/>
   <select aria-label="Genre" value={f.genre} onChange={e=>set('genre',e.target.value)} className={sel}><option value="">All genres</option>{Object.entries(GENRES).map(([n,i])=><option key={i} value={i}>{n}</option>)}</select>
   <input aria-label="Year" type="number" placeholder="Year" value={f.year} onChange={e=>set('year',e.target.value)} className={`${sel} w-24`}/>
   <select aria-label="Minimum rating" value={f.rating} onChange={e=>set('rating',e.target.value)} className={sel}><option value="">Any rating</option>{[5,6,7,8].map(r=><option key={r} value={r}>{r}+</option>)}</select>
   <select aria-label="Language" value={f.lang} onChange={e=>set('lang',e.target.value)} className={sel}><option value="">Any language</option>{[['en','English'],['hi','Hindi'],['ko','Korean'],['ja','Japanese'],['fr','French'],['es','Spanish']].map(([c,n])=><option key={c} value={c}>{n}</option>)}</select>
   <select aria-label="Sort" value={f.sort} onChange={e=>set('sort',e.target.value)} className={sel}><option value="popularity.desc">Popularity</option><option value="vote_average.desc">Rating</option><option value="primary_release_date.desc">Newest</option><option value="title.asc">Title</option></select>
   <button onClick={()=>setF(init)} className="px-3 py-2 rounded-md bg-white/10">Clear all filters</button>
   <button aria-label="Toggle grid or list view" onClick={()=>setGrid(!grid)} className="px-3 py-2 rounded-md bg-white/10">{grid?<List size={18}/>:<LayoutGrid size={18}/>}</button></div>
  {err?<p className="text-reel">{err}</p>:<div className={grid?'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4':'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl'}>{d?d.results.map(m=><MovieCard key={m.id} m={m}/>):<Skeletons n={12}/>}</div>}
  {d&&!d.results.length&&<p className="text-white/60">No movies match these filters. Try clearing a few.</p>}
  {d&&<div className="flex gap-3 items-center justify-center mt-8"><button disabled={f.page<=1} onClick={()=>set('page',f.page-1)} className="px-4 py-2 rounded-md bg-white/10 disabled:opacity-40">Previous</button><span>Page {d.page} of {d.totalPages}</span><button disabled={f.page>=d.totalPages} onClick={()=>set('page',f.page+1)} className="px-4 py-2 rounded-md bg-white/10 disabled:opacity-40">Next</button></div>}</>}
