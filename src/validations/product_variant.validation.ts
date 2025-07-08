import { z } from "zod";

export const createProductVariantSchema = z
  .object({
    name: z.string().min(1),
    display_label: z.string().min(1),
    description: z.string().min(1),
    mrp: z.number().min(0),
    price: z.number().min(0),
    images: z.array(z.string().url()).nonempty(),
    brand_name: z.string().optional().default(""),
    out_of_stock: z.boolean(),
    default_variant: z.boolean().optional().default(false),
    min_quantity: z.number().min(0).optional(),
    max_quantity: z.number().min(0).optional(),
    total_available_quantity: z.number().min(0),
    category_ids: z.array(z.string().uuid()).optional().default([]),
    subcategory_ids: z.array(z.string().uuid()).optional().default([]),
    product_id: z.string().uuid("Invalid product ID"),
  })
  .strict()
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

export type CreateProductVariantInput = z.infer<
  typeof createProductVariantSchema
>;

export const productVariantIdParamSchema = z
  .object({
    id: z.string().uuid("Invalid product variant ID"),
  })

export type ProductVariantIdParam = z.infer<typeof productVariantIdParamSchema>;

export const updateProductVariantSchema = z
  .object({
    display_label: z.string().min(1),
    description: z.string().min(1),
    mrp: z.number().min(0),
    price: z.number().min(0),
    images: z.array(z.string().url()).nonempty(),
    brand_name: z.string().optional().default(""),
    out_of_stock: z.boolean(),
    default_variant: z.boolean().optional().default(false),
    min_quantity: z.number().min(0),
    max_quantity: z.number().min(0),
    total_available_quantity: z.number().min(0),
    category_ids: z.array(z.string().uuid()),
    subcategory_ids: z.array(z.string().uuid()),
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

    return { ...data, min_quantity, max_quantity };
  })
  .refine(
    (data) =>
      data.price === undefined ||
      data.mrp === undefined ||
      data.price <= data.mrp,
    {
      message: "Price must be less than or equal to MRP",
      path: ["price"],
    }
  )
  .refine(
    (data) =>
      data.min_quantity === undefined ||
      data.max_quantity === undefined ||
      data.min_quantity <= data.max_quantity,
    {
      message: "min_quantity must be less than or equal to max_quantity",
      path: ["min_quantity"],
    }
  )
  .refine(
    (data) =>
      data.max_quantity === undefined ||
      data.total_available_quantity === undefined ||
      data.max_quantity <= data.total_available_quantity,
    {
      message:
        "max_quantity must be less than or equal to total_available_quantity",
      path: ["max_quantity"],
    }
  );

export type UpdateProductVariantInput = z.infer<
  typeof updateProductVariantSchema
>;
