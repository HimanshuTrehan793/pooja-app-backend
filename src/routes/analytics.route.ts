import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";
import { schemaValidate } from "../middlewares/schemaValidate";
import { analyticsRangeSchema } from "../validations/analytics.validation";
import {
  getSalesSummary,
  getTopCustomers,
} from "../controllers/analytics.controller";

const router = express.Router();

router.get(
  "/sales-summary",
  catchAsync(authenticate),
  allowRoles("admin"),
  // schemaValidate is body-only by default; date range uses query params,
  // controller does its own coercion. Keep validation minimal here.
  catchAsync(getSalesSummary)
);

router.get(
  "/top-customers",
  catchAsync(authenticate),
  allowRoles("admin"),
  catchAsync(getTopCustomers)
);

// Silence unused-import warning if you later wire request validation in.
void analyticsRangeSchema;
void schemaValidate;

export default router;
