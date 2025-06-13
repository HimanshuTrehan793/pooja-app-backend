import express from "express";
import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  updateSubCategory,
} from "../controllers/sub_category.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import { catchAsync } from "../utils/catchAsync";
import {
  createSubCategorySchema,
  subCategoryIdParamSchema,
} from "../validations/sub_category.validation";
import { updateCategorySchema } from "../validations/category.validation";

const router = express.Router();

router
  .route("/")
  .get(
    catchAsync(getAllSubCategories)
  )
  .post(schemaValidate(createSubCategorySchema), catchAsync(createSubCategory));

router
  .route("/:id")
  .patch(
    schemaValidate(subCategoryIdParamSchema, "params"),
    schemaValidate(updateCategorySchema),
    catchAsync(updateSubCategory)
  )
  .delete(
    schemaValidate(subCategoryIdParamSchema, "params"),
    catchAsync(deleteSubCategory)
  );

export default router;
