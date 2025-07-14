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
import { allowRoles, authenticate } from "../middlewares/auth.middleware";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(getAllSubCategories))
  .post(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(createSubCategorySchema),
    catchAsync(createSubCategory)
  );

router
  .route("/:id")
  .patch(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(subCategoryIdParamSchema, "params"),
    schemaValidate(updateCategorySchema),
    catchAsync(updateSubCategory)
  )
  .delete(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(subCategoryIdParamSchema, "params"),
    catchAsync(deleteSubCategory)
  );

export default router;
