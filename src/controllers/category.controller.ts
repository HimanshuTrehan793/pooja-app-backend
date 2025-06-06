import { Request, Response } from "express";
import { Op, WhereOptions } from "sequelize";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { calculatePagination } from "../utils/pagination";
import { db } from "../models";
import {
  CategoryIdParam,
  CategoryQueryParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../validations/category.validation";
import { sendResponse } from "../utils/sendResponse";
import { ApiError } from "../utils/apiError";

export async function getAllCategories(req: Request, res: Response) {
  const { page, limit, q } = req.query as unknown as CategoryQueryParams;
  const offset = (page - 1) * limit;

  const where: WhereOptions = {
    parent_id: { [Op.is]: null },
    ...(q && { name: { [Op.iLike]: `%${q}%` } }),
  };

  const { count, rows: categories } = await db.Category.findAndCountAll({
    where,
    offset,
    limit: Number(limit),
  });

  const meta = calculatePagination(count, Number(page), Number(limit));

  sendResponse({
    res,
    message: "Categories fetched successfully",
    data: categories,
    meta,
  });

  return;
}

export async function createCategory(req: Request, res: Response) {
  const { name, image } = req.body as CreateCategoryInput;

  const category = await db.Category.create({
    name: name,
    image: image,
  });

  sendResponse({
    res,
    message: "Category created successfully",
    data: category,
    statusCode: HTTP_STATUS_CODES.CREATED,
  });

  return;
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params as CategoryIdParam;
  const updates: UpdateCategoryInput = req.body;

  const category = await db.Category.findByPk(id);
  if (!category || category.parent_id !== null) {
    throw new ApiError(
      "Category not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const updatedCategory = await category.update(updates);
  sendResponse({
    res,
    message: "Category updated successfully",
    data: updatedCategory,
    statusCode: HTTP_STATUS_CODES.OK,
  });
  
  return;
}

export async function deleteCategory(req: Request, res: Response) {
  const { id: categoryId } = req.params as CategoryIdParam;
  const category = await db.Category.destroy({
    where: { id: categoryId, parent_id: { [Op.is]: null } },
  });

  if (!category) {
    throw new ApiError(
      "Category not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  sendResponse({
    res,
    message: "Category deleted successfully",
  });

  return;
}
