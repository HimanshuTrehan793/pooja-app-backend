import { Request, Response } from "express";

import { Op, WhereOptions } from "sequelize";
import { Product } from "../models/product.model";
import { ProductVariant } from "../models/productVariant.model";
import { Category } from "../models/category.model";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { MESSAGES } from "../constants/messages";
import { calculatePagination } from "../utils/pagination";

export async function createVariant(req: Request, res: Response) {
  try {
    let {productId} = req.body;

    
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}

export async function updateVariant(req: Request, res: Response) {
  try {
        const variantId = req.params.id;

  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}

export async function deleteVariant(req: Request, res: Response) {
  try {
    const variantId = req.params.id;

    const variant = await ProductVariant.destroy({
      where: {
        id: variantId,
      },
    });

    if (!variant) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.DELETE_PRODUCT_VARIANT,
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
