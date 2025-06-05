import express from "express";
import { schemaValidate } from "../middlewares/schemaValidate";
import {
  createProductVariantSchema,
  productVariantIdParamSchema,
  updateProductVariantSchema,
} from "../validations/product_variant.validation";
import { catchAsync } from "../utils/catchAsync";
import {
  createProductVariant,
  updateProductVariant,
} from "../controllers/product_variant.controller";

const router = express.Router();

router
  .route("/")
  .post(
    schemaValidate(createProductVariantSchema),
    catchAsync(createProductVariant)
  );

router
  .route("/:id")
  .patch(
    schemaValidate(productVariantIdParamSchema, "params"),
    schemaValidate(updateProductVariantSchema),
    catchAsync(updateProductVariant)
  );

export default router;
