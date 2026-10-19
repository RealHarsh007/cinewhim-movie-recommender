import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_URL||'/api',withCredentials:true,timeout:15000});
export const img=(p,s='w342')=>p?`https://image.tmdb.org/t/p/${s}${p}`:null;
export const errMsg=e=>e.response?.data?.error||'Something went wrong. Please try again.';
export const GENRES={Action:28,Adventure:12,Animation:16,Comedy:35,Crime:80,Drama:18,Family:10751,Fantasy:14,Horror:27,Mystery:9648,Romance:10749,'Sci-Fi':878,Thriller:53};
