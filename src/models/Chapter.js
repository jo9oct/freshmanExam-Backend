
import mongoose from "mongoose";

// Chapter Store database schema
const ChapterSchema=new mongoose.Schema({
    CourseCode:{type:String,required:true,unique:true},
    Chapters:[
        {
            ChapterNumber:{type:Number,required:true},
            ChapterTitle:{type:String,required:true},
            ChapterDescription:{type:String,required:true},
        }
    ]
},{timestamps:true});

export const Chapters=mongoose.model("Chapter" , ChapterSchema);
