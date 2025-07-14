import express from "express";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";
import { updateConfigurationSchema } from "../validations/configuration.validation";
import {
  getConfigurations,
  updateConfiguration,
} from "../controllers/configuration.controller";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(getConfigurations))
  .patch(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(updateConfigurationSchema),
    catchAsync(updateConfiguration)
  );

export default router;
