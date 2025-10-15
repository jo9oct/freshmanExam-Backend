

import express from "express"
import { GetStatusData,CreateStatusData,UpdateStatusData,deleteDataHistory } from "../Controllers/UserStatusData.controller.js";


const router=express();


router.get("/statusData" , GetStatusData);

router.post("/statusData", CreateStatusData);

router.put("/statusData" , UpdateStatusData)

router.post("/del" ,deleteDataHistory )

export default router
