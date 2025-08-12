import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { authenticate } from "../middlewares/auth.middleware";
import { schemaValidate } from "../middlewares/schemaValidate";
import {
  deactivateDeviceSchema,
  registerDeviceSchema,
} from "../validations/device.validation";
import {
  deactivateDevice,
  registerDevice,
} from "../controllers/device.controller";

const router = express.Router();

router
  .route("/")
  .post(
    catchAsync(authenticate),
    schemaValidate(registerDeviceSchema),
    catchAsync(registerDevice)
  )
  .delete(
    catchAsync(authenticate),
    schemaValidate(deactivateDeviceSchema, "body"),
    catchAsync(deactivateDevice)
  );

export default router;
