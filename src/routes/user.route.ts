import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";
import {
  getAllusers,
  getUserDetails,
  sendOtpToUpdateEmail,
  updateUserDetails,
  updateUserEmail,
} from "../controllers/user.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import {
  sendOtpToUpdateEmailSchema,
  updateEmailBodySchema,
  updateUserBodySchema,
} from "../validations/user.validation";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(authenticate), catchAsync(getUserDetails))
  .patch(
    catchAsync(authenticate),
    schemaValidate(updateUserBodySchema),
    catchAsync(updateUserDetails)
  );

router
  .route("/all")
  .get(catchAsync(authenticate), allowRoles("admin"), catchAsync(getAllusers));

router
  .route("/email/otp")
  .post(
    catchAsync(authenticate),
    schemaValidate(sendOtpToUpdateEmailSchema),
    catchAsync(sendOtpToUpdateEmail)
  );

router
  .route("/email")
  .patch(
    catchAsync(authenticate),
    schemaValidate(updateEmailBodySchema),
    catchAsync(updateUserEmail)
  );

export default router;
