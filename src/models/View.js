
import mongoose from "mongoose"

// View Counter Store database schema
const viewSchema = new mongoose.Schema({
    TotalView:{type:Number,default:0},
    TotalBlogView:{type:Number,default:0},
    TotalBlogReader:{type:Number,default:0},
    CorseView:[
        {
            CourseCode:{type:String,required:true,default:""},
            TotalCourseView:{type:Number,default:0},
            TotalQuestionView:{type:Number,default:0}
        }
    ]

}, { timestamps: true });

export const Views = mongoose.model("view", viewSchema);
