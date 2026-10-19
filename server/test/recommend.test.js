import test from 'node:test';import assert from 'node:assert';
import {rank,score,extractPrefs} from '../src/recommend.js';
const m=(id,g,r=8,v=1000,pop=100)=>({id,poster:'/x.jpg',genre_ids:g,rating:r,votes:v,popularity:pop});
const p={genres:[878],moodGenres:[],mood:[]};
test('matching genre ranks first',()=>assert.equal(rank([m(1,[35]),m(2,[878])],p)[0].id,2));
test('disliked and excluded movies are removed',()=>assert.deepEqual(rank([m(1,[878]),m(2,[878]),m(3,[878])],p,{dislikedIds:[1]},{exclude:[2]}).map(x=>x.id),[3]));
test('duplicates removed',()=>assert.equal(rank([m(1,[878]),m(1,[878])],p).length,1));
test('low vote counts are discounted',()=>assert.ok(score(m(1,[878],10,5),p)<score(m(2,[878],8,2000),p)));
test('fallback engine works without AI key',async()=>{delete process.env.AI_API_KEY;const r=await extractPrefs('a mind-bending science fiction thriller',{});assert.equal(r.source,'fallback');assert.ok(r.genres.includes(878)&&r.genres.includes(53))});
