import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
} from "../controllers/category.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import {
  categoryIdParamSchema,
  createCategorySchema,
  getCategoryQuerySchema,
  updateCategorySchema,
} from "../validations/category.validation";
import { catchAsync } from "../utils/catchAsync";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(getAllCategories))
  .post(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(createCategorySchema),
    catchAsync(createCategory)
  );

router
  .route("/:id")
  .get(
    schemaValidate(categoryIdParamSchema, "params"),
    catchAsync(getCategoryById)
  )
  .patch(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(categoryIdParamSchema, "params"),
    schemaValidate(updateCategorySchema),
    catchAsync(updateCategory)
  )
  .delete(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(categoryIdParamSchema, "params"),
    catchAsync(deleteCategory)
  );

export default router;
