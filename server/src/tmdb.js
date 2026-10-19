const cache=new Map();
export async function tmdb(path,params={},ttl=600){
 const qs=new URLSearchParams(Object.entries(params).filter(([,v])=>v!==undefined&&v!==''));
 const key=path+'?'+qs, hit=cache.get(key);
 if(hit&&hit.exp>Date.now())return hit.data;
 qs.set('api_key',process.env.TMDB_API_KEY);
 let res;
 try{res=await fetch(`https://api.themoviedb.org/3${path}?${qs}`,{signal:AbortSignal.timeout(20000)})}
 catch{throw Object.assign(new Error('Movie service timed out'),{status:504})}
 if(!res.ok)throw Object.assign(new Error(res.status===404?'Movie not found':res.status===429?'Movie service busy, retry shortly':'Movie service unavailable'),{status:[404,429].includes(res.status)?res.status:502});
 const data=await res.json();
 cache.set(key,{data,exp:Date.now()+ttl*1000});
 if(cache.size>500)cache.delete(cache.keys().next().value);
 return data; // only non-personalized TMDB data is cached
}
