import { z } from "zod";
import { validateCategoryIds } from "../utils/validateCategoryIds";

export const getProductsQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(30)
  ),
  q: z.string().optional(),
  brand_name: z.string().optional(),
  price_min: z
    .preprocess((val) => Number(val), z.number().min(0).optional())
    .optional(),
  price_max: z
    .preprocess((val) => Number(val), z.number().min(0).optional())
    .optional(),
  category_id: z.string().uuid().optional(),
});

export type ProductQueryParams = z.infer<typeof getProductsQuerySchema>;

export const productVariantSchema = z
  .object({
    name: z.string().min(1),
    display_label: z.string().min(1),
    description: z.string().min(1),
    mrp: z.number().min(0),
    price: z.number().min(0),
    image: z.array(z.string().url()).nonempty(),
    brand_name: z.string().optional().default(""),
    out_of_stock: z.boolean(),
    default_variant: z.boolean().optional().default(false),
    min_quantity: z.number().min(0).optional(),
    max_quantity: z.number().min(0).optional(),
    total_available_quantity: z.number().min(0),
    category_ids: z.array(z.string().uuid()).optional().default([]),
  })
  .transform((data) => {
    const min_quantity = data.out_of_stock
      ? data.min_quantity ?? 0
      : data.min_quantity ?? 1;
    const max_quantity = data.max_quantity ?? data.total_available_quantity;
    return { ...data, min_quantity, max_quantity };
  })
  .refine((data) => data.price <= data.mrp, {
    message: "Price must be less than or equal to MRP",
    path: ["price"],
  })
  .refine((data) => data.min_quantity! <= data.max_quantity!, {
    message: "min_quantity must be less than or equal to max_quantity",
    path: ["min_quantity"],
  })
  .refine((data) => data.max_quantity! <= data.total_available_quantity!, {
    message:
      "max_quantity must be less than or equal to total_available_quantity",
    path: ["max_quantity"],
  });

export type ProductVariant = z.infer<typeof productVariantSchema>;

export const createProductSchema = z
  .object({
    product_variants: z
      .array(productVariantSchema)
      .min(1)
      .refine(
        (variants) => {
          const firstName = variants[0]?.name;
          return variants.every((v) => v.name === firstName);
        },
        {
          message: "All product variant names must be the same",
          path: ["product_variants"],
        }
      ),
  })
  .superRefine(async (data, ctx) => {
    const allCategoryIds = data.product_variants.flatMap((v) => v.category_ids);
    await validateCategoryIds(allCategoryIds, ["product_variants"], ctx);
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const productIdParamSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

export const updateProductBodySchema = z.object({
  name: z.string().min(1, "Product name is required"),
});

export const updateProductPatchSchema = z.object({
  params: productIdParamSchema,
  body: updateProductBodySchema,
});

export type UpdateProductPatchInput = z.infer<typeof updateProductPatchSchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
export type UpdateProductPatchBody = z.infer<typeof updateProductBodySchema>;
