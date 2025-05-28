import express from "express";
import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  getAllSubCategoryById,
  updateSubCategory,
} from "../controller/subcategory.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import { subCategoryValidation } from "../validations/category.validation";

const router = express.Router();

router
  .route("/")
  .get(getAllSubCategories)
  .post(schemaValidate(subCategoryValidation), createSubCategory);

// Routes for "/:id"
router
  .route("/:id")
  .get(getAllSubCategoryById)
  .put(updateSubCategory)
  .delete(deleteSubCategory);

export default router;
