import { Request, Response } from "express";
import {
  CreateProductVariantInput,
  ProductVariantIdParam,
  UpdateProductVariantInput,
} from "../validations/product_variant.validation";
import { ApiError } from "../utils/apiError";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { sendResponse } from "../utils/sendResponse";
import { db } from "../models";

export const createProductVariant = async (req: Request, res: Response) => {
  const product_variant: CreateProductVariantInput = req.body;

  const product = await db.Product.findByPk(product_variant.product_id);
  if (!product) {
    throw new ApiError(
      "Product not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const existingVariant = await db.ProductVariant.findOne({
    where: { product_id: product_variant.product_id },
  });

  if (existingVariant?.name !== product_variant.name) {
    throw new ApiError(
      "Invalid product variant name",
      HTTP_STATUS_CODES.BAD_REQUEST,
      "bad request"
    );
  }

  const newProductVariant = await db.ProductVariant.create({
    ...product_variant,
  });

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.CREATED,
    message: "Product variant created successfully",
    data: newProductVariant,
  });
};

export const updateProductVariant = async (req: Request, res: Response) => {
  const productVariant: UpdateProductVariantInput = req.body;
  const { id: productVariantId } = req.params as ProductVariantIdParam;
};
