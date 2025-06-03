import { Router } from "express";
import {
  logoutHandler,
  refreshTokenHandler,
  sendOtpHandler,
  verifyOtpHandler,
} from "../controllers/auth.controller";
import { catchAsync } from "../utils/catchAsync";
import { schemaValidate } from "../middlewares/schemaValidate";
import { sendOtpSchema, verifyOtpSchema } from "../validations/auth.validation";

const router = Router();

router.post("/otp", schemaValidate(sendOtpSchema), catchAsync(sendOtpHandler));
router.post(
  "/verify",
  schemaValidate(verifyOtpSchema),
  catchAsync(verifyOtpHandler)
);
router.post("/refresh", catchAsync(refreshTokenHandler));
router.post("/logout", catchAsync(logoutHandler));

export default router;
