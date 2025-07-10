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
    charges: z
      .array(
        z.object({
          type: z.enum(["delivery"]),
          name: z.string(),
          amount: z.number(),
        })
      )
      .optional(),
  })
  .strict();

export type CreateOrderBody = z.infer<typeof createOrderSchema>;

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyPaymentBody = z.infer<typeof verifyPaymentSchema>;

export const orderIdParamSchema = z.object({
  id: z.string().uuid("Invalid order ID"),
});

export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const getAllOrdersQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(30)
  ),
  status: z
    .preprocess(
      (val) => (typeof val === "string" ? val.split(",") : val),
      z.array(
        z.enum([
          "pending",
          "accepted",
          "processing",
          "packed",
          "shipped",
          "out_for_delivery",
          "delivered",
          "cancelled",
          "rejected",
          "returned",
          "refunded",
        ])
      )
    )
    .optional(),
  user_id: z.string().uuid().optional(),
  order_number: z
    .preprocess((val) => Number(val), z.number().min(1).optional())
    .optional(),
});

export type GetAllOrdersQuery = z.infer<typeof getAllOrdersQuerySchema>;
