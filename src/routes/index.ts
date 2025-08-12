import { Router } from "express";

import authRoutes from "./auth.route";
import productRoutes from "./product.route";
import productVariantRoutes from "./product_variant.route";
import categoryRoutes from "./category.route";
import subCategoryRoutes from "./subcategory.route";
import configurationRoutes from "./configuration.route";
import assetRoutes from "./asset.route";
import couponRoutes from "./coupon.route";
import addressRoutes from "./address.route";
import cartRoutes from "./cart.route";
import mapRoutes from "./map.route";
import userRoutes from "./user.route";
import orderRoutes from "./order.route";
import deviceRoutes from "./device.route";

const router = Router();

router.use("/auth", authRoutes);
router.use("/api/products", productRoutes);
router.use("/api/variants", productVariantRoutes);
router.use("/api/categories", categoryRoutes);
router.use("/api/sub-categories", subCategoryRoutes);
router.use("/api/configurations", configurationRoutes);
router.use("/api/assets", assetRoutes);
router.use("/api/addresses", addressRoutes);
router.use("/api/maps", mapRoutes);
router.use("/api/cart-items", cartRoutes);
router.use("/api/users", userRoutes);
router.use("/api/coupons", couponRoutes);
router.use("/api/orders", orderRoutes);
router.use("/api/devices", deviceRoutes);

export default router;
