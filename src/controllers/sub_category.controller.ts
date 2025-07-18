import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { db } from "../models";
import {
  CreateSubCategoryInput,
  getSubCategroyQuerySchema,
  SubCategoryIdParam,
  SubCategoryQueryParams,
} from "../validations/sub_category.validation";
import { ApiError } from "../utils/apiError";
import { Op } from "sequelize";
import { sendResponse } from "../utils/sendResponse";
import { UpdateCategoryInput } from "../validations/category.validation";
import { parseQueryParams } from "../utils/parseQueryParams";
import { calculatePagination } from "../utils/pagination";

export const getAllSubCategories = async (req: Request, res: Response) => {
  const { parent_ids, page, limit, q, sort_by, sort_order } = parseQueryParams(
    getSubCategroyQuerySchema,
    req.query
  ) as SubCategoryQueryParams;

  const offset = (page - 1) * limit;

  let categoryIds: string[] = [];

  if (parent_ids) {
    categoryIds = parent_ids
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    const invalidId = categoryIds.find(
      (id) =>
        !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
          id
        )
    );

    if (invalidId) {
      throw new ApiError(
        `Invalid UUID: ${invalidId}`,
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Validation Error"
      );
    }
  }

  if (categoryIds && categoryIds.length > 0) {
    const categories = await db.Category.findAll({
      where: {
        id: { [Op.in]: categoryIds },
        parent_id: { [Op.is]: null },
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new ApiError(
        "Invalid Category IDs provided",
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Validation Error"
      );
    }

    const { count, rows: subCategories } = await db.Category.findAndCountAll({
      where: {
        parent_id: { [Op.in]: categoryIds },
        ...(q && { name: { [Op.iLike]: `%${q}%` } }),
      },
      offset,
      limit: Number(limit),
      order: sort_by && sort_order ? [[sort_by, sort_order]] : undefined,
    });

    const meta = calculatePagination(count, Number(page), Number(limit));
  
    sendResponse({
      res,
      message: "Subcategories fetched successfully",
      data: subCategories,
      meta,
    });

    return;
  }
};

export const createSubCategory = async (req: Request, res: Response) => {
  const { name, image, parent_id } = req.body as CreateSubCategoryInput;
  const parentCategory = await db.Category.findByPk(parent_id);

  if (!parentCategory || parentCategory.parent_id !== null) {
    throw new ApiError(
      "Parent Category not found or is not a top-level category",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const highestPrioritySubCategory = await db.Category.findOne({
    where: { parent_id },
    order: [["priority", "DESC"]],
  });

  const subCategoryPriority = highestPrioritySubCategory
    ? Number(highestPrioritySubCategory.priority) + 1000
    : 1000;

  const subCategory = await db.Category.create({
    name,
    image,
    parent_id,
    priority: subCategoryPriority,
  });

  sendResponse({
    res,
    message: "Subcategory created successfully",
    data: subCategory,
    statusCode: HTTP_STATUS_CODES.CREATED,
  });

  return;
};

export const updateSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params as SubCategoryIdParam;
  const updates: UpdateCategoryInput = req.body;

  if (updates.priority) {
    const existingSubCategory = await db.Category.findOne({
      where: { priority: updates.priority, parent_id: id },
    });

    if (existingSubCategory) {
      throw new ApiError(
        "Priority already exists for another subcategory",
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Validation Error"
      );
    }
  }

  const subCategory = await db.Category.findOne({
    where: { id, parent_id: { [Op.not]: null } },
  });

  if (!subCategory) {
    throw new ApiError(
      "Subcategory not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  const updatedSubCategory = await subCategory.update(updates);
  sendResponse({
    res,
    message: "Subcategory updated successfully",
    data: updatedSubCategory,
    statusCode: HTTP_STATUS_CODES.OK,
  });

  return;
};

export const deleteSubCategory = async (req: Request, res: Response) => {
  const { id } = req.params as SubCategoryIdParam;

  const subCategory = await db.Category.destroy({
    where: { id, parent_id: { [Op.not]: null } },
  });

  if (!subCategory) {
    throw new ApiError(
      "Subcategory not found",
      HTTP_STATUS_CODES.NOT_FOUND,
      "not found"
    );
  }

  sendResponse({
    res,
    message: "Subcategory deleted successfully",
  });

  return;
};
