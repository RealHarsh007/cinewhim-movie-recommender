import {useEffect,useState} from 'react';import {useParams,useNavigate} from 'react-router-dom';import {ArrowLeft,ThumbsUp,ThumbsDown,Share2} from 'lucide-react';import toast from 'react-hot-toast';
import {api,img,errMsg} from '../api';import {useApp} from '../App';import MovieCard from '../components/MovieCard';
export default function Movie(){const {id}=useParams(),nav=useNavigate(),{wl,toggle,user}=useApp(),[m,setM]=useState(null),[err,setErr]=useState(''),[sim,setSim]=useState([]);
 useEffect(()=>{setM(null);setErr('');window.scrollTo(0,0);api.get('/movies/'+id).then(r=>setM(r.data)).catch(e=>setErr(errMsg(e)));api.get(`/movies/${id}/similar`).then(r=>setSim(r.data.results.slice(0,6))).catch(()=>setSim([]))},[id]);
 if(err)return <p className="text-reel">{err} <button className="underline" onClick={()=>nav(-1)}>Go back</button></p>;
 if(!m)return <div className="skeleton h-96 rounded-xl"/>;
 const fb=async v=>{if(!user)return toast('Log in to rate movies');try{await api.post('/users/feedback',{movieId:m.id,value:v});toast.success('Thanks, this shapes your recommendations')}catch(e){toast.error(errMsg(e))}};
 return <><button onClick={()=>nav(-1)} className="flex items-center gap-1 mb-3 text-white/70"><ArrowLeft size={16}/>Back</button>
  <div className="relative rounded-2xl overflow-hidden"><img src={img(m.backdrop,'w1280')} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30"/>
   <div className="relative p-5 md:p-8 flex flex-col md:flex-row gap-6">{m.poster&&<img src={img(m.poster,'w500')} alt={`${m.title} poster`} className="w-48 rounded-lg self-center md:self-start"/>}
    <div><h1 className="text-3xl md:text-5xl font-extrabold">{m.title}</h1>{m.originalTitle!==m.title&&<p className="text-white/60">{m.originalTitle}</p>}
     <p className="mt-2 text-white/70">{m.year} · {m.runtime} min · {m.lang?.toUpperCase()} · {m.rating.toFixed(1)}/10 ({m.votes.toLocaleString()} votes)</p>
     <p className="mt-2 flex flex-wrap gap-2">{m.genres?.map(g=><span key={g.id} className="text-xs px-2 py-1 rounded-full bg-white/10">{g.name}</span>)}</p>
     <p className="mt-4 max-w-2xl">{m.overview||'No overview available.'}</p>
     {m.director&&<p className="mt-3 text-sm"><b>Director:</b> {m.director}</p>}{m.cast.length>0&&<p className="text-sm"><b>Cast:</b> {m.cast.map(c=>c.name).join(', ')}</p>}
     <div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>toggle(m)} className="px-4 py-2 rounded-lg bg-reel">{wl.some(x=>x.id===m.id)?'Remove from watchlist':'Add to watchlist'}</button>
      <button aria-label="Like" onClick={()=>fb(1)} className="p-2.5 rounded-lg bg-white/10"><ThumbsUp size={18}/></button><button aria-label="Dislike" onClick={()=>fb(-1)} className="p-2.5 rounded-lg bg-white/10"><ThumbsDown size={18}/></button>
      <button aria-label="Copy link" onClick={()=>navigator.clipboard.writeText(location.href).then(()=>toast.success('Link copied'))} className="p-2.5 rounded-lg bg-white/10"><Share2 size={18}/></button></div></div></div></div>
  {m.trailerKey?<div className="mt-8 aspect-video max-w-3xl"><iframe className="w-full h-full rounded-xl" src={`https://www.youtube-nocookie.com/embed/${m.trailerKey}`} title={`${m.title} trailer`} allowFullScreen/></div>:<p className="mt-8 text-white/50">No trailer available.</p>}
  {sim.length>0&&<section className="mt-10"><h2 className="text-2xl font-bold mb-3">Similar movies</h2><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">{sim.map(s=><MovieCard key={s.id} m={s}/>)}</div></section>}</>}
