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
import { runInTransaction } from "../utils/transaction";

export const createProductVariant = async (req: Request, res: Response) => {
  const { category_ids, ...product_variant }: CreateProductVariantInput =
    req.body;

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

  const newProductVariant = await runInTransaction(async (tx) => {
    const variant = await db.ProductVariant.create(product_variant, {
      transaction: tx,
    });

    if (category_ids.length > 0) {
      const categories = await db.Category.findAll({
        where: { id: category_ids },
        transaction: tx,
      });

      if (categories.length !== category_ids.length) {
        throw new ApiError(
          "Invalid category_ids provided",
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Validation Error"
        );
      }

      await variant.setCategories(categories, { transaction: tx });
    }

    return variant;
  });

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.CREATED,
    message: "Product variant created successfully",
    data: newProductVariant,
  });

  return;
};

export const updateProductVariant = async (req: Request, res: Response) => {
  const { category_ids, ...updatedVariant }: UpdateProductVariantInput =
    req.body;
  const { id: productVariantId } = req.params as ProductVariantIdParam;

  const existingProductVariant = await db.ProductVariant.findByPk(
    productVariantId
  );

  if (!existingProductVariant) {
    throw new ApiError(
      "Product variant not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const result = await runInTransaction(async (tx) => {
    await existingProductVariant.update(updatedVariant, { transaction: tx });

    if (category_ids !== undefined) {
      const categories = await db.Category.findAll({
        where: { id: category_ids },
        transaction: tx,
      });

      if (categories.length !== category_ids.length) {
        throw new ApiError(
          "One or more category_ids are invalid",
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Validation Error"
        );
      }

      await existingProductVariant.setCategories(categories, {
        transaction: tx,
      });
    }

    return existingProductVariant.reload({ transaction: tx });
  });

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.OK,
    message: "Product variant updated successfully",
    data: result,
  });

  return;
};

export const deleteProductVariantById = async (req: Request, res: Response) => {
  const { id: productVariantId } = req.params as ProductVariantIdParam;
  const productVariant = await db.ProductVariant.findByPk(productVariantId);

  if (!productVariant) {
    throw new ApiError(
      "Product variant not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  await productVariant.destroy();

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.NO_CONTENT,
    message: "Product variant deleted successfully",
  });

  return;
};
