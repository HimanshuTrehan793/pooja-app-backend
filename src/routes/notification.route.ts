import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { schemaValidate } from "../middlewares/schemaValidate";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";
import { broadcastNotificationSchema } from "../validations/notification.validation";
import { broadcastNotification } from "../controllers/notification.controller";

const router = express.Router();

router.post(
  "/broadcast",
  catchAsync(authenticate),
  allowRoles("admin"),
  schemaValidate(broadcastNotificationSchema),
  catchAsync(broadcastNotification)
);

export default router;
