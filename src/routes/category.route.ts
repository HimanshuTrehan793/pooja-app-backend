import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getAllCategoryById,
  updateCategory,
} from "../controller/category.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import { categoryValidation } from "../validations/category.validation";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(schemaValidate(categoryValidation), createCategory);

// Routes for "/:id"
router
  .route("/:id")
  .get(getAllCategoryById)
  .put(schemaValidate(categoryValidation), updateCategory)
  .delete(deleteCategory);

export default router;
