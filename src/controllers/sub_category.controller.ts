import { Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { db } from "../models";
import {
  CreateSubCategoryInput,
  SubCategoryIdParam,
  SubCategoryQueryParams,
} from "../validations/sub_category.validation";
import { ApiError } from "../utils/apiError";
import { Op } from "sequelize";
import { sendResponse } from "../utils/sendResponse";
import { UpdateCategoryInput } from "../validations/category.validation";

export const getAllSubCategories = async (req: Request, res: Response) => {
  const { parent_ids } = req.query as SubCategoryQueryParams;

  if (parent_ids && parent_ids.length > 0) {
    const categories = await db.Category.findAll({
      where: {
        id: { [Op.in]: parent_ids },
        parent_id: { [Op.is]: null },
      },
    });

    if (categories.length !== parent_ids.length) {
      throw new ApiError(
        "Invalid Category IDs provided",
        HTTP_STATUS_CODES.BAD_REQUEST,
        "Validation Error"
      );
    }

    const subCategories = await db.Category.findAll({
      where: {
        parent_id: { [Op.in]: parent_ids },
      },
    });

    sendResponse({
      res,
      message: "Subcategories fetched successfully",
      data: subCategories,
      statusCode: HTTP_STATUS_CODES.OK,
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

  const subCategory = await db.Category.create({
    name,
    image,
    parent_id,
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
