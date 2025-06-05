import { Request, Response } from "express";

import { Op, where, WhereOptions } from "sequelize";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { MESSAGES } from "../constants/messages";
import { calculatePagination } from "../utils/pagination";
import { db } from "../models";
import {
  CategoryIdParam,
  CategoryQueryParams,
} from "../validations/category.validation";
import { sendResponse } from "../utils/sendResponse";
import { ApiError } from "../utils/apiError";

export async function getAllCategories(req: Request, res: Response) {
  const { page, limit, q } = req.query as unknown as CategoryQueryParams;
  const where: WhereOptions = {
    parent_id: { [Op.is]: null },
    ...(q && { name: { [Op.iLike]: `%${q}%` } }),
  };
  const { count, rows: categories } = await db.Category.findAndCountAll({
    where,
    offset: ((Number(page) || 1) - 1) * (Number(limit) || 10),
    limit: Number(limit) || 10,
  });

  const meta = calculatePagination(count, Number(page), Number(limit));

  if (!categories) {
    sendResponse({
      res,
      message: "Categories Not Found",
      data: [],
      meta,
    });
  } else {
    sendResponse({
      res,
      message: "Categories fetched successfully",
      data: categories,
      meta,
    });
  }
}

export async function createCategory(req: Request, res: Response) {
  let { name, image } = req.body;

  const category = await db.Category.create({
    name: name,
    image: image,
  });

  if (!category) {
    sendResponse({
      res,
      message: "Category creation failed",
    });
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  } else {
    sendResponse({
      res,
      message: "Category created successfully",
      data: category,
    });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params as CategoryIdParam;

  const category = db.Category.destroy({
    where: {
      id: id,
    },
  });

  if (!category) {
    sendResponse({
      res,
      message: "Category Not found",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    });
  } else {
    sendResponse({
      res,
      message: "Category delted successfully",
    });
  }
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params as CategoryIdParam;

  let { name, image } = req.body;

  const [affectedCount] = await db.Category.update(
    { name, image },
    { where: { id } }
  );

  if (affectedCount === 0) {
    // Nothing was updated
    sendResponse({
      res,
      message: "Category Not Found",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    });
  } else {
    const category = await db.Category.findByPk(id);

    if (!category) {
      sendResponse({
        res,
        message: "Category Updation failed",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    } else {
      sendResponse({
        res,
        message: "Category Updated successfully",
        data: category,
      });
    }
  }
}
