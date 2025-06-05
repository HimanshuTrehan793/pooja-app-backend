import { Request, Response } from "express";

import { Op, WhereOptions } from "sequelize";

import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { calculatePagination } from "../utils/pagination";
import { db } from "../models";
import {
  CategoryIdParam,
  CategoryQueryParams,
} from "../validations/category.validation";
import { sendResponse } from "../utils/sendResponse";



export async function getSubCategoriesById(req: Request, res: Response) {
  const { id } = req.params as CategoryIdParam;
  const subCategories = await db.Category.findAndCountAll({
    where: {
      parent_id: id,
    },
  });

  if (!subCategories) {
    sendResponse({
      res,
      message: "Sub Category Not found",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    });
  } else {
    sendResponse({
      res,
      message: "Sub Categories Fetched Successfully",
      data: subCategories,
    });
  }
}


export async function getSubCategoryById(req: Request, res: Response) {
  const { id } = req.params as CategoryIdParam;
  const subCategories = await db.Category.findOne({
    where: {
      parent_id: id,
    },
  });

  if (!subCategories) {
    sendResponse({
      res,
      message: "Sub Category Not found",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    });
  } else {
    sendResponse({
      res,
      message: "Sub Categories Fetched Successfully",
      data: subCategories,
    });
  }
}

export async function createSubCategory(req: Request, res: Response) {
  let { name, image, categoryId } = req.body;

  const category = await db.Category.create({
    name: name,
    image: image,
    parent_id: categoryId,
  });

  if (!category) {
    sendResponse({
      res,
      message: "Sub Category Not Found",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    });
  } else {
    sendResponse({
      res,
      message: "SubCategory created successfully",
      data: category,
    });
  }
}

export async function updateSubCategory(req: Request, res: Response) {
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
      message: "SubCategory Not Found",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    });
  } else {
    const category = await db.Category.findByPk(id);

    if (!category) {
      sendResponse({
        res,
        message: "SubCategory Updation failed",
        statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      });
    } else {
      sendResponse({
        res,
        message: "SubCategory Updated successfully",
        data: category,
      });
    }
  }
}

export async function deleteSubCategory(req: Request, res: Response) {
  const { id } = req.params as CategoryIdParam;

  const category = db.Category.destroy({
    where: {
      id: id,
    },
  });

  if (!category) {
    sendResponse({
      res,
      message: "SubCategory Not found",
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
    });
  } else {
    sendResponse({
      res,
      message: "SubCategory delted successfully",
    });
  }
}
