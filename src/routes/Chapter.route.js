

import express from "express"
import { GetChapters,CreateChapters,UpdateChapters,DeleteChapters } from "../Controllers/Chapter.Controller.js";


const router=express();


router.get("/" , GetChapters);

router.post("/", CreateChapters);

router.put("/:id" , UpdateChapters)
  
router.delete("/:id", DeleteChapters)

export default router