
import express from "express"
import { GetCourses,CreateCourses,UpdateCourses,DeleteCourses } from "../Controllers/Course.Controller.js";


const router=express();


router.get("/" , GetCourses);

router.post("/", CreateCourses);

router.put("/:id" , UpdateCourses)
  
router.delete("/:id" , DeleteCourses)

export default router