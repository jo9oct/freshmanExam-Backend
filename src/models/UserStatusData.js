

import mongoose from "mongoose";

// User Status Store database schema
const CourseSchema=new mongoose.Schema({
    userName:{type:String,required:true},
    StatusData:[
        {
            chapterName:{type:String,required:true,default:""},
            data: {type:Number,required:true,default:0}
        }
    ]
},{timestamps:true});

export const StatusData=mongoose.model("statusData" , CourseSchema);
