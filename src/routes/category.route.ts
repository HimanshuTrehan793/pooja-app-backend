import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
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

const router = express.Router();

router
  .route("/")
  .get(
    schemaValidate(getCategoryQuerySchema, "query"),
    catchAsync(getAllCategories)
  )
  .post(schemaValidate(createCategorySchema), catchAsync(createCategory));

router
  .route("/:id")
  .patch(
    schemaValidate(categoryIdParamSchema, "params"),
    schemaValidate(updateCategorySchema),
    catchAsync(updateCategory)
  )
  .delete(
    schemaValidate(categoryIdParamSchema, "params"),
    catchAsync(deleteCategory)
  );

export default router;
