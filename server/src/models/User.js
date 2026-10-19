import mongoose from 'mongoose';
const movie={id:Number,title:String,poster:String,rating:Number,year:String,_id:false};
const s=new mongoose.Schema({
 name:{type:String,required:true,trim:true,maxlength:60},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 password:{type:String,required:true},
 favoriteGenres:[Number],languages:[String],favoriteMovies:[movie],
 watchlist:[movie],recent:[movie],
 feedback:[{movieId:Number,value:Number,genres:[Number],_id:false}]
},{timestamps:true});
export default mongoose.model('User',s);
