
import express from "express";
import { CreateEmail } from "../Controllers/email.Controller.js";

const router = express.Router();

router.post("/", CreateEmail)

export default router;