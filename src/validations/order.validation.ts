import { z } from "zod";

export const getOrderQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(30)
  ),
});

export type OrderQueryParams = z.infer<typeof getOrderQuerySchema>;

export const createOrderSchema = z
  .object({
    items: z.array(
      z.object({
        product_variant_id: z.string().uuid(),
        quantity: z.number().min(1).max(1000),
      })
    ),
    offer_codes: z.array(z.string()).optional(),
    address_id: z.string().uuid(),
  })
  .strict();

export type CreateOrderBody = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyPaymentBody = z.infer<typeof verifyPaymentSchema>;
