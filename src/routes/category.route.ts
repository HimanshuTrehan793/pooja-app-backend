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

const router = express.Router();

router
  .route("/")
  .get(
    catchAsync(getAllCategories)
  )
  .post(schemaValidate(createCategorySchema), catchAsync(createCategory));

router
  .route("/:id")
  .get(
    schemaValidate(categoryIdParamSchema, "params"),
    catchAsync(getCategoryById)
  )
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
