import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/product.controller";
import {
  createProductSchema,
  getProductsQuerySchema,
  productIdParamSchema,
  updateProductBodySchema,
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
  // .get(
  //   schemaValidate(productIdParamSchema, "params"),
  //   catchAsync(getProductById)
  // )
  .patch(
    schemaValidate(productIdParamSchema, "params"),
    schemaValidate(updateProductBodySchema),
    catchAsync(updateProduct)
  )
  .delete(
    schemaValidate(productIdParamSchema, "params"),
    catchAsync(deleteProduct)
  );

export default router;
