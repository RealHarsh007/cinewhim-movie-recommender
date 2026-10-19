import mongoose from 'mongoose';
import {app} from './app.js';
for (const k of ['MONGODB_URI','TMDB_API_KEY','JWT_SECRET']) if(!process.env[k]){console.error(`Missing env var ${k}`);process.exit(1)}
if(process.env.JWT_SECRET.length<32){console.error('JWT_SECRET must be 32+ chars');process.exit(1)}
await mongoose.connect(process.env.MONGODB_URI);
app.listen(process.env.PORT||5000,()=>console.log('CineMind API ready'));
