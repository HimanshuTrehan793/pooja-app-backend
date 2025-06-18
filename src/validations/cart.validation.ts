import e from "express";
import { z } from "zod";

export const addItemToCartSchema = z.object({
  product_variant_id: z.string().uuid("Invalid product variant ID"),
});

export type AddItemToCartInput = z.infer<typeof addItemToCartSchema>;

export const cartVariantIdParamsSchema = z.object({
  product_variant_id: z.string().uuid("Invalid product variant ID"),
});

export type CartVariantIdParams = z.infer<typeof cartVariantIdParamsSchema>;

export const updateCartItemBodySchema = z.object({
  action: z.enum(["increase", "decrease"]),
});

export type UpdateCartItemBody = z.infer<typeof updateCartItemBodySchema>;
