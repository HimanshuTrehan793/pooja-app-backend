import { Router } from "express";

import authRoutes from "./auth.routes";
import productRoutes from "./product.route";
import productVariantRoutes from "./product_variant.route";
import categoryRoutes from "./category.route";
import subCategoryRoutes from "./subcategory.route";
import configurationRoutes from "./configuration.route";
import assetRoutes from "./assets.route";

import addressRoutes from "./address.route"
import cartRoutes from "./cart.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/api/products", productRoutes);
router.use("/api/variants", productVariantRoutes);
router.use("/api/categories", categoryRoutes);
router.use("/api/sub-categories", subCategoryRoutes);
router.use("/api/configurations", configurationRoutes);
router.use("/api/assets", assetRoutes);
router.use("/api/address",addressRoutes)
router.use("/api/cart-items", cartRoutes);

export default router;
