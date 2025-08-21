import { Request, Response, NextFunction } from "express";

import { Op, WhereOptions } from "sequelize";
import { ProductVariant } from "../models/productVariant.model";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { calculatePagination } from "../utils/pagination";
import {
  CreateProductInput,
  getProductsQuerySchema,
  ProductIdParam,
  ProductQueryParams,
  SearchProductsQueryParams,
  searchProductsQuerySchema,
  UpdateProductPatchBody,
} from "../validations/product.validation";
import { sendResponse } from "../utils/sendResponse";
import { ApiError } from "../utils/apiError";
import { db } from "../models";
import { runInTransaction } from "../utils/transaction";
import { parseQueryParams } from "../utils/parseQueryParams";
import { Product } from "../models/product.model";

export const getAllProducts = async (req: Request, res: Response) => {
  const { page, limit, q, brand_name, price_min, price_max, category_id } =
    parseQueryParams(getProductsQuerySchema, req.query) as ProductQueryParams;

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
        include: [
          {
            model: db.Category,
            as: "categories",
            attributes: ["id", "parent_id", "name", "image"],
            through: { attributes: [] }, // needed to skip join table metadata
            ...(category_id && {
              where: {
                id: category_id,
              },
            }),
          },
        ],
      },
    ],
  });

  const meta = calculatePagination(count, Number(page), Number(limit));

  sendResponse({
    res,
    message: "Products with variants fetched successfully",
    data: products,
    meta,
  });
};

export const searchProducts = async (req: Request, res: Response) => {
  const { q, limit, page } = parseQueryParams(
    searchProductsQuerySchema,
    req.query
  ) as SearchProductsQueryParams;

  const offset = (page - 1) * limit;
  const whereVariant: WhereOptions<ProductVariant> = q
    ? { name: { [Op.iLike]: `%${q}%` } }
    : {};

  let products: Product[] = [];

  const totalCount = await db.ProductVariant.count({
    where: whereVariant,
    distinct: true,
    col: "product_id",
  });

  if (totalCount > offset) {
    const productIdRows = (await db.ProductVariant.findAll({
      where: whereVariant,
      attributes: [
        [
          db.sequelize.fn("DISTINCT", db.sequelize.col("product_id")),
          "product_id",
        ],
      ],
      order: [["product_id", "ASC"]],
      limit,
      offset,
      raw: true,
    })) as { product_id: string }[];

    const productIds = productIdRows.map((row) => row.product_id);

    if (productIds.length > 0) {
      products = await db.Product.findAll({
        where: { id: { [Op.in]: productIds } },
        include: [{ model: ProductVariant, as: "product_variants" }],
      });
    }
  }

  const meta = calculatePagination(totalCount, Number(page), Number(limit));

  sendResponse({
    res,
    message: "Products with variants fetched successfully",
    data: products,
    meta,
  });
};

export const createProduct = async (req: Request, res: Response) => {
  const { product_variants } = req.body as CreateProductInput;

  const result = await runInTransaction(async (tx) => {
    const product = await db.Product.create({}, { transaction: tx });

    const variants = await db.ProductVariant.bulkCreate(
      product_variants.map((variant) => ({
        ...variant,
        product_id: product.id,
      })),
      { validate: true, transaction: tx }
    );

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const categoryIds = product_variants[i].category_ids ?? [];
      const subCategoryIds = product_variants[i].subcategory_ids ?? [];

      if (categoryIds.length > 0) {
        const allCategoryIds = [...categoryIds, ...subCategoryIds];

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

        if (validCategoryIds.length !== categoryIds.length) {
          throw new ApiError(
            `One or more category_ids in product_variant[${i}] are invalid`,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Validation Error"
          );
        }

        if (validSubcategoryIds.length !== subCategoryIds.length) {
          throw new ApiError(
            `One or more subcategory_ids in product_variant[${i}] are invalid`,
            HTTP_STATUS_CODES.BAD_REQUEST,
            "Validation Error"
          );
        }

        await variant.setCategories(allCategories, { transaction: tx });
      }
    }

    return { product, variants };
  });

  sendResponse({
    res,
    statusCode: HTTP_STATUS_CODES.CREATED,
    message: "Product created successfully",
    data: {
      ...result.product.toJSON(),
      product_variants: result.variants.map((v) => v.toJSON()),
    },
  });

  return;
};

export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params as ProductIdParam;

  const product = await db.Product.findByPk(id);
  if (!product) {
    throw new ApiError(
      "Product not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const updatedVariants = await ProductVariant.findAll({
    where: {
      product_id: id,
    },
    include: [
      {
        model: db.Category,
        as: "categories",
        attributes: ["id", "parent_id", "name", "image"],
        through: { attributes: [] }, // needed to skip join table metadata
      },
    ],
  });

  sendResponse({
    res,
    message: "Product updated successfully",
    data: {
      ...product.toJSON(),
      product_variants: updatedVariants,
    },
  });

  return;
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
    where: {
      product_id: id,
    },
    include: [
      {
        model: db.Category,
        as: "categories",
        attributes: ["id", "parent_id", "name", "image"],
        through: { attributes: [] }, // needed to skip join table metadata
      },
    ],
  });

  sendResponse({
    res,
    message: "Product updated successfully",
    data: {
      ...product.toJSON(),
      product_variants: updatedVariants,
    },
  });

  return;
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

  return;
};
