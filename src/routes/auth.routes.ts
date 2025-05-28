import { Router } from "express";
import { sendOtpHandler } from "../controllers/auth.controller";
import { catchAsync } from "../utils/catchAsync";

const router = Router();

router.post("/send-otp", catchAsync(sendOtpHandler));

export default router;
