import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import { createOrder, getUserAllOrders, verifyPayment } from "../controllers/order.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import {
  createOrderSchema,
  verifyPaymentSchema,
} from "../validations/order.validation";

const router = Router();

router
  .route("/")
  .get(catchAsync(authenticate), catchAsync(getUserAllOrders))
  .post(
    catchAsync(authenticate),
    schemaValidate(createOrderSchema),
    catchAsync(createOrder)
  );

router.post(
  "/payment-verification",
  catchAsync(authenticate),
  schemaValidate(verifyPaymentSchema),
  catchAsync(verifyPayment)
);
export default router;
