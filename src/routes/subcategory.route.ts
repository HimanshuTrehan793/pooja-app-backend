import express from "express";
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategoriesById,
  getSubCategoryById,
  updateSubCategory,
} from "../controllers/subcategory.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import { categoryValidation } from "../validations/category.validation";
import { catchAsync } from "../utils/catchAsync";

const router = express.Router();

router
  .route("/")
  .post(schemaValidate(categoryValidation), catchAsync(createSubCategory));

 router.route("/subCategoryList/:id").get(catchAsync(getSubCategoryById)) 

// Routes for "/:id"
router
  .route("/:id")
  .get(getSubCategoriesById)
  .patch(catchAsync(updateSubCategory))
  .delete(catchAsync(deleteSubCategory));

  

export default router;
