import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller";
import {
  createProductSchema,
  getProductsQuerySchema,
  updateProductBodySchema,
  updateProductParamsSchema,
} from "../validations/product.validation";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();

router
  .route("/")
  .get(
    schemaValidate(getProductsQuerySchema, "query"),
    catchAsync(getAllProducts)
  )
  .post(schemaValidate(createProductSchema), catchAsync(createProduct));

router
  .route("/:id")
  .patch(
    schemaValidate(updateProductParamsSchema, "params"),
    schemaValidate(updateProductBodySchema),
    catchAsync(updateProduct)
  );

export default router;
