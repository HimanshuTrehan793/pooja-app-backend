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
import { Op } from "sequelize";

export const createProductVariant = async (req: Request, res: Response) => {
  const {
    category_ids,
    subcategory_ids,
    ...product_variant
  }: CreateProductVariantInput = req.body;

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
      const allCategoryIds = [...category_ids, ...subcategory_ids];

      const allCategories = await db.Category.findAll({
        where: {
          id: allCategoryIds,
        },
        transaction: tx,
      });

      const validCategoryIds = allCategories
        .filter((cat) => cat.parent_id === null)
        .map((cat) => cat.id);
      const validSubcategoryIds = allCategories
        .filter((cat) => cat.parent_id !== null)
        .map((cat) => cat.id);

      if (validCategoryIds.length !== category_ids.length) {
        throw new ApiError(
          `One or more category_ids in product_variant are invalid`,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Validation Error"
        );
      }

      if (validSubcategoryIds.length !== subcategory_ids.length) {
        throw new ApiError(
          `One or more subcategory_ids in product_variant are invalid`,
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Validation Error"
        );
      }

      await variant.setCategories(allCategories, { transaction: tx });
    }

    return variant;
  });

  // Fetch categories and subcategories after creation
  const allCategories = await newProductVariant.getCategories();

  const filteredCategories = allCategories.map((cat: any) => ({
    id: cat.id,
    parent_id: cat.parent_id,
    name: cat.name,
    image: cat.image,
  }));

  // Send response
  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.CREATED,
    message: "Product variant created successfully",
    data: {
      ...newProductVariant.toJSON(),
      categories: filteredCategories,
    },
  });

  return;
};

export const updateProductVariant = async (req: Request, res: Response) => {
  const {
    category_ids = [],
    subcategory_ids = [],
    ...updatedVariant
  }: UpdateProductVariantInput = req.body;

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

    const allCategoryIds = [...category_ids, ...subcategory_ids];

    if (allCategoryIds.length) {
      const categories = await db.Category.findAll({
        where: { id: allCategoryIds },
        transaction: tx,
      });

      if (categories.length !== allCategoryIds.length) {
        throw new ApiError(
          "One or more category_ids or sub_category_ids are invalid",
          HTTP_STATUS_CODES.BAD_REQUEST,
          "Validation Error"
        );
      }

      await existingProductVariant.setCategories(categories, {
        transaction: tx,
      });
    }

    // Reload with associated categories to construct response
    return await db.ProductVariant.findByPk(productVariantId, {
      transaction: tx,
      include: [
        {
          model: db.Category,
          as: "categories",
          attributes: ["id", "parent_id","name","image"],
          through: { attributes: [] },
        },
      ],
    });
  });



  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.OK,
    message: "Product variant updated successfully",
    data: result
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
