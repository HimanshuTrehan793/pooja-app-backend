import { Request, Response } from "express";

import { Op, WhereOptions } from "sequelize";
import { Product } from "../models/product.model";
import { ProductVariant } from "../models/productVariant.model";
import { Category } from "../models/category.model";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";
import { MESSAGES } from "../constants/messages";
import { calculatePagination } from "../utils/pagination";

export async function getAllProducts(req: Request, res: Response) {
  try {
    const { page = "1", pageSize = "10" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const sizeNum = parseInt(pageSize as string, 10);
    const offset = (pageNum - 1) * sizeNum;

    const productWhere: WhereOptions<Product> = {};
    const variantWhere: WhereOptions<ProductVariant> = {};
    const categoryWhere: WhereOptions<Category> = {};

    const rawSearch = (req.query.search as string) || "";
    const search = rawSearch.replace(/^["']|["']$/g, "").trim();

    if (search) {
      variantWhere.name = {
        [Op.iLike]: `%${search}%`, // case-insensitive match
      };
    }

    // const { count, rows: products } = await Product.findAndCountAll({
    //   limit: sizeNum,
    //   offset,
    //   include: [
    //     {
    //       model: ProductVariant,
    //       as: "product_variants",
    //       required: true,
    //       where: Object.keys(variantWhere).length ? variantWhere : undefined,
    //       include: [
    //         {
    //           model: Category,
    //           as: "categories",
    //           required: true,
    //           where: Object.keys(categoryWhere).length
    //             ? categoryWhere
    //             : undefined,
    //           through: { attributes: [] }, // hide join table fields
    //         },
    //       ],
    //     },
    //   ],
    //   where: productWhere,
    //   distinct: true, // ensures correct count with joins
    // });

    const { count, rows: products } = await Product.findAndCountAll({
      limit: sizeNum,
      offset,
      include: [
        {
          model: ProductVariant,
          as: "product_variants",
          required: true,
          where: Object.keys(variantWhere).length ? variantWhere : undefined,
          include: [
            {
              model: Category,
              as: "categories",
              required: false,
              where: Object.keys(categoryWhere).length
                ? categoryWhere
                : undefined,
              through: { attributes: [] }, // hide join table fields
            },
          ],
        },
      ],
      where: productWhere,
      distinct: true,
    });

    console.log("my proudcr");
    console.log(products);

    const modifiedProducts = products.map((product: any) => {
      const firstMatchingVariant = product.product_variants?.[0];
      return {
        ...product.toJSON(),
        product_variants: firstMatchingVariant ? [firstMatchingVariant] : [],
      };
    });

    const pagination = calculatePagination(count, pageNum, sizeNum);

    res.status(HTTP_STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.SUCCESS.GET_ALL_PRODUCTS,
      data: {
        products: modifiedProducts,
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

export async function getProductById(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    console.log(productId);

    const product = await Product.findOne({
      include: [
        {
          model: ProductVariant,
          as: "product_variants",
          required: true,
          where: {
            id: productId,
          },
          include: [
            {
              model: Category,
              as: "categories",
              required: true,
              through: { attributes: [] }, // hide join table fields
            },
          ],
        },
      ],
    });

    if (!product) {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.NO_PRODUCTS_FOUND,
        data: [],
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.GET_ALL_PRODUCTS,
        data: product,
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

export async function createProduct(req: Request, res: Response) {
  try {
    let { product_variants } = req.body;

    const out_of_stock = product_variants.find(
      async (variant: ProductVariant) => variant.out_of_stock == true
    );

    const product = await Product.create({
      out_of_stock: out_of_stock ? true : false,
    });

    console.log("my product");
    console.log(product);

    const variantsWithProductId = product_variants.map(
      (variant: ProductVariant) => ({
        ...variant,
        product_id: product.dataValues.id,
      })
    );
    await ProductVariant.bulkCreate(variantsWithProductId);

    // await Promise.all(
    //   product_variants.map(async (variant: any) => {
    //     console.log(product_variants);
    //   })
    // );
    
    res.status(HTTP_STATUS_CODES.OK).json({
      status: HTTP_STATUS_CODES.OK,
      message: MESSAGES.SUCCESS.CREATE_PRODUCTS,
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
      message: MESSAGES.ERROR,
    });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const productId = req.params.id;

    const result = await Product.destroy({
      where: {
        id: productId,
      },
    });

    if (!result) {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: MESSAGES.ERROR,
      });
    } else {
      res.status(HTTP_STATUS_CODES.OK).json({
        status: HTTP_STATUS_CODES.OK,
        message: MESSAGES.SUCCESS.DELETE_PRODUCTS,
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
