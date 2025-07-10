import { Router } from "express";
import { allowRoles, authenticate } from "../middlewares/auth.middleware";
import { catchAsync } from "../utils/catchAsync";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserAllOrders,
  updateOrderStatus,
  verifyPayment,
} from "../controllers/order.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import {
  createOrderSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
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

router
  .route("/all")
  .get(catchAsync(authenticate), allowRoles("admin"), catchAsync(getAllOrders));

router
  .route("/:id")
  .get(
    catchAsync(authenticate),
    schemaValidate(orderIdParamSchema, "params"),
    catchAsync(getOrderById)
  );

router
  .route("/:id/status")
  .patch(
    catchAsync(authenticate),
    schemaValidate(orderIdParamSchema, "params"),
    allowRoles("admin"),
    schemaValidate(updateOrderStatusSchema),
    catchAsync(updateOrderStatus)
  );

router.post(
  "/payment-verification",
  catchAsync(authenticate),
  schemaValidate(verifyPaymentSchema),
  catchAsync(verifyPayment)
);
export default router;
