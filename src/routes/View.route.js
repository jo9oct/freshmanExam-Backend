
import express from "express"
import { CreateView ,GetView,updateView} from "../Controllers/View.controller.js";

const router=express()

router.post("/" ,CreateView )
router.get("/" ,GetView )
router.put("/" ,updateView )

export default router
