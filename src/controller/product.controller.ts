import { Request, Response } from "express";

import { Op } from "sequelize";
import { Product } from "../models/product.model";
import { ProductVariant } from "../models/productVariant.model";
import { Category } from "../models/category.model";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { MESSAGES } from "../constants/messages";
import { calculatePagination } from "../utils/pagination";

export async function getAllProducts(req: Request, res: Response) {
  try {
    const {
      page = "1",
      pageSize = "10",
      search = "",
      category_id,
      sub_category_id,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const sizeNum = parseInt(pageSize as string, 10);
    const offset = (pageNum - 1) * sizeNum;

    const productWhere: any = {};
    const variantWhere: any = {};
    const categoryWhere: any = {};

    if (search) {
      variantWhere.name = {
        [Op.iLike]: `%${search}%`, // case-insensitive match
      };
    }

    if (category_id) {
      categoryWhere.id = category_id;
    }

    if (sub_category_id) {
      categoryWhere.id = sub_category_id;
    }

    const { count, rows: products } = await Product.findAndCountAll({
      limit: sizeNum,
      offset,
      include: [
        {
          model: ProductVariant,
          as: "product_variants",
          where: Object.keys(variantWhere).length ? variantWhere : undefined,
          include: category_id || sub_category_id
            ? [
                {
                  model: Category,
                  as: "categories",
                  where: categoryWhere,
                  through: { attributes: [] }, // hide join table fields
                },
              ]
            : [],
        },
      ],
      where: productWhere,
      distinct: true, // ensures correct count with joins
    });

    const pagination = calculatePagination(count, pageNum, sizeNum);

    res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: MESSAGES.SUCCESS.GET_ALL_PRODUCTS,
      data: {
        products,
        pagination,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}
