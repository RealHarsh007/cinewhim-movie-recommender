import express from 'express';import helmet from 'helmet';import cors from 'cors';import cookieParser from 'cookie-parser';import rateLimit from 'express-rate-limit';
import routes from './routes.js';
export const app=express();
app.set('trust proxy',1);
app.use(helmet());
app.use(cors({origin:(process.env.CLIENT_URL||'http://localhost:5173').split(','),credentials:true}));
app.use(express.json({limit:'10kb'}));app.use(cookieParser());
// NoSQL-injection guard: drop keys starting with $ or containing dots
const strip=o=>{if(o&&typeof o==='object')for(const k of Object.keys(o)){if(k.startsWith('$')||k.includes('.'))delete o[k];else strip(o[k])}};
app.use((q,_s,n)=>{strip(q.body);strip(q.query);n()});
app.use('/api/auth',rateLimit({windowMs:15*60e3,limit:50}));
app.use('/api/ai',rateLimit({windowMs:60e3,limit:10}));
app.use('/api',routes);
app.use((_q,s)=>s.status(404).json({error:'Not found'}));
app.use((e,_q,s,_n)=>{const c=e.status||500;if(c===500)console.error(e.message);s.status(c).json({error:c===500?'Server error':e.message})});
