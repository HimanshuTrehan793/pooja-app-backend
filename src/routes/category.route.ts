import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "../controllers/category.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import { categoryValidation } from "../validations/category.validation";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(getAllCategories))
  .post(schemaValidate(categoryValidation), catchAsync( createCategory));

// Routes for "/:id"
router
  .route("/:id")
  .patch( catchAsync(updateCategory))
  .delete(catchAsync(deleteCategory));

export default router;
