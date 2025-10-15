
import express from "express"
import { GetBlogs,CreateBlogs,UpdateBlogs,DeleteBlogs } from "../Controllers/Blog.Controller.js";


const router=express();


router.get("/" , GetBlogs);

router.post("/", CreateBlogs);

router.put("/:id" , UpdateBlogs)
  
router.delete("/:id" , DeleteBlogs)

export default router
