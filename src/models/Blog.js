
import mongoose from "mongoose";

// Blog post database schema
const CourseSchema=new mongoose.Schema({
    BlogAuthor:{type:String,required:true},
    BlogTitle:{type:String,required:true},
    BlogSlug:{type:String,required:true},
    BlogContent:{type:String,required:true},
    BlogDescription:{type:String,required:true},
    BlogTag:{type:String,required:true},
    BlogPublish:{type:Boolean,required:true},
    BlogImg:{type:String,required:true},
    BlogTime:{type:Number,required:true},
},{timestamps:true});

export const Blogs=mongoose.model("blog" , CourseSchema);

