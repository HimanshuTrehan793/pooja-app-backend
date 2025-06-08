import express from "express";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";
import {  updateConfigurationSchema } from "../validations/configuration.validation";
import { getConfigurations, updateConfiguration } from "../controllers/configuration.controller";

const router = express.Router();

router
  .route("/")
  .get(
    catchAsync(getConfigurations)
  )
  .patch(schemaValidate(updateConfigurationSchema), catchAsync(updateConfiguration));



export default router;
