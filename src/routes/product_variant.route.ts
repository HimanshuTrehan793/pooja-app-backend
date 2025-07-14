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
  deleteProductVariantById,
  updateProductVariant,
} from "../controllers/product_variant.controller";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router
  .route("/")
  .post(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(createProductVariantSchema),
    catchAsync(createProductVariant)
  );

router
  .route("/:id")
  .patch(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(productVariantIdParamSchema, "params"),
    schemaValidate(updateProductVariantSchema),
    catchAsync(updateProductVariant)
  )
  .delete(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(productVariantIdParamSchema, "params"),
    catchAsync(deleteProductVariantById)
  );

export default router;
