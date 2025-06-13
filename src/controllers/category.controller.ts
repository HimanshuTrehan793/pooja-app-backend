import { Request, Response } from "express";
import { Op, WhereOptions } from "sequelize";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { calculatePagination } from "../utils/pagination";
import { db } from "../models";
import {
  CategoryIdParam,
  CategoryQueryParams,
  CreateCategoryInput,
  getCategoryQuerySchema,
  UpdateCategoryInput,
} from "../validations/category.validation";
import { sendResponse } from "../utils/sendResponse";
import { ApiError } from "../utils/apiError";
import { parseQueryParams } from "../utils/parseQueryParams";

export const getAllCategories = async (req: Request, res: Response) => {
  const { page, limit, q, sort_by, sort_order } = parseQueryParams(
    getCategoryQuerySchema,
    req.query
  ) as CategoryQueryParams;

  const offset = (page - 1) * limit;

  const where: WhereOptions = {
    parent_id: { [Op.is]: null },
    ...(q && { name: { [Op.iLike]: `%${q}%` } }),
  };

  const { count, rows: categories } = await db.Category.findAndCountAll({
    where,
    offset,
    limit: Number(limit),
    order: sort_by && sort_order ? [[sort_by, sort_order]] : undefined,
  });

  const meta = calculatePagination(count, Number(page), Number(limit));

  sendResponse({
    res,
    message: "Categories fetched successfully",
    data: categories,
    meta,
  });

  return;
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, image } = req.body as CreateCategoryInput;

  const highestPriorityCategory = await db.Category.findOne({
    where: { parent_id: { [Op.is]: null } },
    order: [["priority", "DESC"]],
  });

  const categoryPriority = highestPriorityCategory
    ? highestPriorityCategory.priority + 1000
    : 1000;

  const category = await db.Category.create({
    name: name,
    image: image,
    priority: categoryPriority,
  });

  sendResponse({
    res,
    message: "Category created successfully",
    data: category,
    statusCode: HTTP_STATUS_CODES.CREATED,
  });

  return;
};

export const getCategoryById = async (req: Request, res: Response) => {
  const { id } = req.params as CategoryIdParam;

  const category = await db.Category.findOne({
    where: { id, parent_id: { [Op.is]: null } },
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
    message: "Category fetched successfully",
    data: category,
  });

  return;
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params as CategoryIdParam;
  const updates: UpdateCategoryInput = req.body;

  if (updates.priority) {
    const existingCategory = await db.Category.findOne({
      where: { priority: updates.priority, parent_id: { [Op.is]: null } },
    });

    if (existingCategory) {
      throw new ApiError(
        "Priority already exists for another category",
        HTTP_STATUS_CODES.BAD_REQUEST,
        "priority_exists"
      );
    }
  }

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
};

export const deleteCategory = async (req: Request, res: Response) => {
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
};
