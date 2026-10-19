import {useState} from 'react';import {Link} from 'react-router-dom';import {useApp} from '../App';import MovieCard from '../components/MovieCard';
export default function Watchlist(){const {wl}=useApp(),[q,setQ]=useState(''),[s,setS]=useState('title');
 const items=wl.filter(m=>m.title.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>s==='title'?a.title.localeCompare(b.title):s==='rating'?b.rating-a.rating:(b.year||'').localeCompare(a.year||''));
 return <><h1 className="text-3xl font-extrabold mb-4">Watchlist</h1>
  {!wl.length?<p className="text-white/60">Nothing saved yet. <Link to="/discover" className="underline">Find a movie to save</Link>.</p>:<>
  <div className="flex gap-2 mb-5"><input aria-label="Search watchlist" placeholder="Search saved movies" value={q} onChange={e=>setQ(e.target.value)} className="bg-panel rounded-md px-3 py-2"/>
   <select aria-label="Sort" value={s} onChange={e=>setS(e.target.value)} className="bg-panel rounded-md px-3 py-2"><option value="title">Title</option><option value="rating">Rating</option><option value="year">Newest</option></select></div>
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">{items.map(m=><MovieCard key={m.id} m={m}/>)}</div></>}</>}
