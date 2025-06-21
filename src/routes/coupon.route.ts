import express from "express";
import { catchAsync } from "../utils/catchAsync";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";
import {
  createCoupon,
  deletCouponById,
  deleteAllCoupons,
  getAllCoupons,
  getCouponById,
  updateCoupon,
} from "../controllers/coupon.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import {
  couponIdParamsSchema,
  createCouponSchema,
  updateCouponSchema,
} from "../validations/coupon.validation";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(authenticate), catchAsync(getAllCoupons))
  .post(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(createCouponSchema),
    catchAsync(createCoupon)
  )
  .delete(
    catchAsync(authenticate),
    allowRoles("admin"),
    catchAsync(deleteAllCoupons)
  );

router
  .route("/:id")
  .get(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(couponIdParamsSchema, "params"),
    catchAsync(getCouponById)
  )
  .patch(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(couponIdParamsSchema, "params"),
    schemaValidate(updateCouponSchema),
    catchAsync(updateCoupon)
  )
  .delete(
    catchAsync(authenticate),
    allowRoles("admin"),
    schemaValidate(couponIdParamsSchema, "params"),
    catchAsync(deletCouponById)
  );

export default router;
