import { Request, Response, NextFunction } from "express";

import { Op, WhereOptions } from "sequelize";
import { ProductVariant } from "../models/productVariant.model";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { calculatePagination } from "../utils/pagination";
import {
  CreateProductInput,
  ProductIdParam,
  ProductQueryParams,
  UpdateProductPatchBody,
} from "../validations/product.validation";
import { sendResponse } from "../utils/sendResponse";
import { ApiError } from "../utils/apiError";
import { db } from "../models";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page, limit, q, brand_name, price_min, price_max, category_id } =
    req.query as unknown as ProductQueryParams;

  const offset = (page - 1) * limit;

  const whereVariant: WhereOptions = {};
  if (q) whereVariant.name = { [Op.iLike]: `%${q}%` };
  if (brand_name) whereVariant.brand_name = brand_name;
  if (price_min || price_max) {
    whereVariant.price = {
      ...(price_min ? { [Op.gte]: price_min } : {}),
      ...(price_max ? { [Op.lte]: price_max } : {}),
    };
  }

  const includeCategory = category_id
    ? [
        {
          model: db.Category,
          as: "categories",
          where: { id: category_id },
          through: { attributes: [] },
          attributes: [],
          required: true,
        },
      ]
    : [];

  const { count, rows: products } = await db.Product.findAndCountAll({
    distinct: true,
    limit: Number(limit),
    offset,
    include: [
      {
        model: ProductVariant,
        as: "product_variants",
        where: Object.keys(whereVariant).length ? whereVariant : undefined,
        required: true,
        include: includeCategory,
      },
    ],
  });

  const meta = calculatePagination(count, Number(page), Number(limit));

  return sendResponse({
    res,
    message: "Products with variants fetched successfully",
    data: products,
    meta,
  });
};

export const createProduct = async (req: Request, res: Response) => {
  const { product_variants } = req.body as CreateProductInput;
  const product = await db.Product.create({});

  const variants = await ProductVariant.bulkCreate(
    product_variants.map((variant) => ({
      ...variant,
      product_id: product.id,
    })),
    { validate: true }
  );

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const categoryIds = product_variants[i].category_ids ?? [];

    if (categoryIds.length > 0) {
      await variant.setCategories(categoryIds);
    }
  }

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.CREATED,
    message: "Product created successfully",
    data: {
      ...product.toJSON(),
      product_variants: variants.map((v) => v.toJSON()),
    },
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params as ProductIdParam;
  const { name } = req.body as UpdateProductPatchBody;

  const product = await db.Product.findByPk(id);
  if (!product) {
    throw new ApiError(
      "Product not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  await ProductVariant.update({ name }, { where: { product_id: id } });

  const updatedVariants = await ProductVariant.findAll({
    where: { product_id: id },
  });

  sendResponse({
    res,
    message: "Product updated successfully",
    data: {
      ...product.toJSON(),
      product_variants: updatedVariants.map((v) => v.toJSON()),
    },
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params as ProductIdParam;

  const product = await db.Product.destroy({ where: { id } });
  if (!product) {
    throw new ApiError(
      "Product not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  sendResponse({
    res,
    message: "Product deleted successfully",
  });
};
