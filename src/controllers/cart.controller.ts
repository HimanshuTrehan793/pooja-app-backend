import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { db } from "../models";
import { sendResponse } from "../utils/sendResponse";
import {
  AddItemToCartInput,
  CartVariantIdParams,
  UpdateCartItemBody,
} from "../validations/cart.validation";

export const getUserCartItems = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;

  const cartItems = await db.CartItem.findAll({
    where: { user_id },
    include: [
      {
        model: db.ProductVariant,
        as: "variant",
      },
    ],
  });

  sendResponse({
    res,
    message: "Cart items retrieved successfully",
    data: cartItems,
  });
};

export const addItemToCart = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { product_variant_id } = req.body as AddItemToCartInput;

  const productVariant = await db.ProductVariant.findByPk(product_variant_id);
  if (!productVariant) {
    throw new ApiError(
      "Product variant not found",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  const existingCartItem = await db.CartItem.findOne({
    where: { user_id, product_variant_id },
  });

  if (existingCartItem) {
    throw new ApiError(
      "Item already exists in cart. Use update API to modify quantity.",
      HttpStatusCode.BAD_REQUEST,
      "Item already in cart"
    );
  }

  const quantity = productVariant.min_quantity || 1;

  if (quantity > productVariant.total_available_quantity) {
    throw new ApiError(
      `Requested quantity not available. Only ${productVariant.total_available_quantity} in stock.`,
      HttpStatusCode.BAD_REQUEST,
      "Insufficient stock"
    );
  }

  const cartItem = await db.CartItem.create({
    user_id,
    product_variant_id,
    quantity,
  });

  sendResponse({
    res,
    data: { ...cartItem.toJSON(), variant: productVariant },
    message: "Item added to cart successfully",
  });
};

export const removeAllCartItems = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;

  await db.CartItem.destroy({
    where: { user_id },
  });

  sendResponse({
    res,
    message: "All cart items removed successfully",
  });
};

export const getCartItemByVariantId = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { product_variant_id } = req.params as CartVariantIdParams;

  const cartItem = await db.CartItem.findOne({
    where: {
      user_id,
      product_variant_id: product_variant_id,
    },
    include: [
      {
        model: db.ProductVariant,
        as: "variant",
      },
    ],
  });

  if (!cartItem) {
    throw new ApiError(
      "Cart item not found",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  sendResponse({
    res,
    data: cartItem,
    message: "Cart item retrieved successfully",
  });
};

export const incrementDecrementCartItemQuantity = async (
  req: Request,
  res: Response
) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { product_variant_id } = req.params as CartVariantIdParams;
  const { action } = req.body as UpdateCartItemBody;

  const quantity = 1;

  const productVariant = await db.ProductVariant.findByPk(product_variant_id);
  if (!productVariant) {
    throw new ApiError(
      "Product variant not found",
      HttpStatusCode.NOT_FOUND,
      "not found"
    );
  }

  const cartItem = await db.CartItem.findOne({
    where: {
      user_id,
      product_variant_id: product_variant_id,
    },
  });

  if (!cartItem) {
    throw new ApiError(
      "Item not found in cart",
      HttpStatusCode.NOT_FOUND,
      "Item not in cart"
    );
  }

  let newQuantity = cartItem.quantity;

  if (action === "increase") {
    newQuantity += quantity;

    if (
      productVariant.max_quantity &&
      newQuantity > productVariant.max_quantity
    ) {
      throw new ApiError(
        `Max quantity per order is ${productVariant.max_quantity}`,
        HttpStatusCode.BAD_REQUEST,
        "Max quantity exceeded"
      );
    }

    if (newQuantity > productVariant.total_available_quantity) {
      throw new ApiError(
        `Requested quantity not available. Only ${productVariant.total_available_quantity} in stock.`,
        HttpStatusCode.BAD_REQUEST,
        "Insufficient stock"
      );
    }
  } else if (action === "decrease") {
    newQuantity -= quantity;

    if (newQuantity <= 0 || newQuantity < (productVariant.min_quantity || 1)) {
      await cartItem.destroy();

      sendResponse({
        res,
        message: "Item removed from cart successfully",
      });
      return;
    }
  }

  cartItem.quantity = newQuantity;
  await cartItem.save();

  sendResponse({
    res,
    data: {
      ...cartItem.toJSON(),
      variant: productVariant,
    },
    message: `Cart item quantity ${action}d successfully`,
  });
};

export const deleteCartItem = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(
      "User not authenticated",
      HttpStatusCode.UNAUTHORIZED,
      "Authentication Failed"
    );
  }

  const { id: user_id } = req.user;
  const { product_variant_id } = req.params as CartVariantIdParams;

  const cartItem = await db.CartItem.findOne({
    where: {
      user_id,
      product_variant_id: product_variant_id,
    },
  });

  if (!cartItem) {
    throw new ApiError(
      "Item not found in cart",
      HttpStatusCode.NOT_FOUND,
      "Item not in cart"
    );
  }

  await cartItem.destroy();

  sendResponse({
    res,
    message: "Item removed from cart successfully",
  });
};
