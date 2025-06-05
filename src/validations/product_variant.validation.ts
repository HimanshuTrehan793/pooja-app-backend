import { z } from "zod";
import { productVariantSchema } from "./product.validation";
import { validateCategoryIds } from "../utils/validateCategoryIds";

export const createProductVariantSchema = z
  .object({
    product_id: z.string().uuid("Invalid product ID"),
    product_variant: productVariantSchema,
  })
  .strict();

export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;

export const productVariantIdParamSchema = z
  .object({
    id: z.string().uuid("Invalid product variant ID"),
  })
  .strict();

export type ProductVariantIdParam = z.infer<typeof productVariantIdParamSchema>;

export const updateProductVariantSchema = z
  .object({
    display_label: z.string().min(1),
    description: z.string().min(1),
    mrp: z.number().min(0),
    price: z.number().min(0),
    image: z.array(z.string().url()).nonempty(),
    brand_name: z.string().optional().default(""),
    out_of_stock: z.boolean(),
    default_variant: z.boolean().optional().default(false),
    min_quantity: z.number().min(0),
    max_quantity: z.number().min(0),
    total_available_quantity: z.number().min(0),
    category_ids: z.array(z.string().uuid()),
  })
  .partial()
  .strict()
  .transform((data) => {
    const out_of_stock = data.out_of_stock ?? false;
    const min_quantity = out_of_stock
      ? data.min_quantity ?? 0
      : data.min_quantity ?? 1;

    const max_quantity =
      data.max_quantity ?? data.total_available_quantity ?? min_quantity;

    return {
      ...data,
      min_quantity,
      max_quantity,
    };
  })
  .refine(
    (data) => {
      if (data.price !== undefined && data.mrp !== undefined) {
        return data.price <= data.mrp;
      }
      return true;
    },
    {
      message: "Price must be less than or equal to MRP",
      path: ["price"],
    }
  )
  .refine(
    (data) => {
      if (data.min_quantity !== undefined && data.max_quantity !== undefined) {
        return data.min_quantity <= data.max_quantity;
      }
      return true;
    },
    {
      message: "min_quantity must be less than or equal to max_quantity",
      path: ["min_quantity"],
    }
  )
  .refine(
    (data) => {
      if (
        data.max_quantity !== undefined &&
        data.total_available_quantity !== undefined
      ) {
        return data.max_quantity <= data.total_available_quantity;
      }
      return true;
    },
    {
      message:
        "max_quantity must be less than or equal to total_available_quantity",
      path: ["max_quantity"],
    }
  )
  .superRefine(async (data, ctx) => {
    if (data.category_ids && data.category_ids.length === 0) {
      await validateCategoryIds(data.category_ids, ["category_ids"], ctx);
    }
    return;
  });

export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantSchema
>;
