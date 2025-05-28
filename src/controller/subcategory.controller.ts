import { Request, Response } from "express";

import { Op, where, WhereOptions } from "sequelize";
import { Product } from "../models/product.model";
import { ProductVariant } from "../models/productVariant.model";
import { Category } from "../models/category.model";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { MESSAGES } from "../constants/messages";
import { calculatePagination } from "../utils/pagination";

export async function getAllSubCategories(req: Request, res: Response) {
  try {
    const subCategories = await Category.findAndCountAll({
      where: {
        parent_id: {
          [Op.not]: null,
        },
      },
    });

    if (!subCategories) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.GET_ALL_SUBCATEGORIES,
        data: subCategories,
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

export async function getAllSubCategoryById(req: Request, res: Response) {
  try {
    const categoryId = req.params.id;
    const subCategories = await Category.findAndCountAll({
      where: {
        parent_id: categoryId,
      },
    });

    if (!subCategories) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.GET_ALL_SUBCATEGORIES,
        data: subCategories,
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

export async function createSubCategory(req: Request, res: Response) {
  try {
    let { categoryId, name, image } = req.body;

    const subCategory = Category.create({
      parent_id: categoryId,
      name: name,
      image: image,
    });

    if (!subCategory) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.CREATE_SUBCATEGORY,
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

export async function updateSubCategory(req: Request, res: Response) {
  try {
    const subCategoryId = req.params.id;
    let { name, image } = req.body;

    const subCategory = Category.update(
      {
        name: name,
        image: image,
      },
      {
        where: {
          id: subCategoryId,
        },
      }
    );

    if (!subCategory) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.UPDATE_SUBCATEGORY,
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

export async function deleteSubCategory(req: Request, res: Response) {
  try {
    const subCategoryId = req.params.id;

    const subCategory = Category.destroy({
      where: {
        id: subCategoryId,
      },
    });
    if (!subCategory) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.DELETE_SUBCATEGORY,
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
