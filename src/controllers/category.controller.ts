import { Request, Response } from "express";

import { Op, where, WhereOptions } from "sequelize";
import { Product } from "../models/product.model";
import { ProductVariant } from "../models/productVariant.model";
import { Category } from "../models/category.model";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { MESSAGES } from "../constants/messages";
import { calculatePagination } from "../utils/pagination";

export async function getAllCategories(req: Request, res: Response) {
  try {
    const categories = await Category.findAndCountAll({
      where: {
        parent_id: {
          [Op.is]: null,
        },
      },
    });

    if (!categories) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.GET_ALL_CATEGORIES,
        data: categories,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}

export async function getAllCategoryById(req: Request, res: Response) {
  try {
    const categoryId = req.params.id;
    const categories = await Category.findOne({
      where: {
        id: categoryId,
      },
    });

    if (!categories) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.GET_ALL_CATEGORIES,
        data: categories,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    let { name, image } = req.body;

    const category = await Category.create({
      name: name,
      image: image,
    });

    if (!category) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS,
        data: category,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    const categoryId = req.params.id;

    const category = Category.destroy({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.DELETE_CATEGORY,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    let { name, image, categoryId } = req.body;

    const category = Category.update(
      {
        name: name,
        image: image,
      },
      {
        where: {
          id: categoryId,
        },
      }
    );

    if (!category) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.UPDATE_CATEGORY,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}
