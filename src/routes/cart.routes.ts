import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import { authenticate } from "../middlewares/auth.middleware";
import {
  addItemToCart,
  deleteCartItem,
  getCartItemByVariantId,
  getUserCartItems,
  incrementDecrementCartItemQuantity,
  removeAllCartItems,
} from "../controllers/cart.controller";
import { schemaValidate } from "../middlewares/schemaValidate";
import { addItemToCartSchema, cartVariantIdParamsSchema, updateCartItemBodySchema } from "../validations/cart.validation";

const router = Router();

router
  .route("/")
  .get(catchAsync(authenticate), catchAsync(getUserCartItems))
  .post(
    catchAsync(authenticate),
    schemaValidate(addItemToCartSchema),
    catchAsync(addItemToCart)
  )
  .delete(catchAsync(authenticate), catchAsync(removeAllCartItems));

router
  .route("/:product_variant_id")
  .get(
    catchAsync(authenticate),
    schemaValidate(cartVariantIdParamsSchema, "params"),
    catchAsync(getCartItemByVariantId)
  )
  .patch(
    catchAsync(authenticate),
    schemaValidate(cartVariantIdParamsSchema, "params"),
    schemaValidate(updateCartItemBodySchema),
    catchAsync(incrementDecrementCartItemQuantity)
  )
  .delete(
    catchAsync(authenticate),
    schemaValidate(cartVariantIdParamsSchema, "params"),
    catchAsync(deleteCartItem)
  );

export default router;
