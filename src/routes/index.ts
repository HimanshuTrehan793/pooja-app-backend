import { Router } from "express";

import authRoutes from "./auth.routes";
import productRoutes from "./product.route";
import productVariantRoutes from "./product_variant.route";
 import categoryRoutes from "./category.route";
 import subCategoryRoutes from "./subcategory.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/api/products", productRoutes);
router.use("/api/variants", productVariantRoutes);
router.use("/api/categories", categoryRoutes);
router.use("/api/sub-categories", subCategoryRoutes);

export default router;
