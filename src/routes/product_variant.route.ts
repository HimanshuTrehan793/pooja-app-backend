import express from "express";
import {
  createVariant,
  deleteVariant,
  updateVariant,
} from "../controllers/product_variant.controller";

const router = express.Router();

router.route("/:id").put(updateVariant).delete(deleteVariant);

// Route for /
router.route("/").post(createVariant);
export default router;
