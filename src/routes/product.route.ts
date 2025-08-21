import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  updateProduct,
} from "../controllers/product.controller";
import {
  createProductSchema,
  productIdParamSchema,
  updateProductBodySchema,
} from "../validations/product.validation";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(getAllProducts))
  .post(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(createProductSchema),
    catchAsync(createProduct)
  );

router.route("/search").get(catchAsync(searchProducts));

router
  .route("/:id")
  .get(
    schemaValidate(productIdParamSchema, "params"),
    catchAsync(getProductById)
  )
  .patch(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(productIdParamSchema, "params"),
    schemaValidate(updateProductBodySchema),
    catchAsync(updateProduct)
  )
  .delete(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(productIdParamSchema, "params"),
    catchAsync(deleteProduct)
  );

export default router;
