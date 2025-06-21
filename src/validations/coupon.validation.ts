import { z } from "zod";

export const createCouponSchema = z
  .object({
    offer_code: z.string().min(1),
    description: z.string().min(1),
    discount_type: z.enum(["percentage", "fixed"]),
    discount_value: z.number().min(0),
    min_discount_value: z.number().min(0).optional(),
    max_discount_value: z.number().min(0).optional(),
    min_order_value: z.number().min(0).default(0),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    is_active: z.boolean().default(true),
    usage_limit_per_user: z.number().min(1).optional(),
  })
  .strict()
  .refine((data) => data.start_date < data.end_date, {
    message: "Start date must be before end date",
    path: ["start_date"],
  })
  .refine((data) => data.end_date > new Date(), {
    path: ["end_date"],
    message: "end_date must be a future date",
  })
  .refine(
    (data) =>
      data.discount_type !== "percentage" ||
      (data.discount_value <= 100 && data.discount_value >= 0),
    {
      message:
        "For percentage discount, discount_value must be between 0 and 100",
      path: ["discount_value"],
    }
  )
  .refine(
    (data) =>
      data.discount_type !== "percentage" ||
      data.min_discount_value !== undefined,
    {
      path: ["min_discount_value"],
      message: "min_discount_value is required for percentage discount",
    }
  )
  .refine(
    (data) =>
      data.discount_type !== "percentage" ||
      data.max_discount_value !== undefined,
    {
      path: ["max_discount_value"],
      message: "max_discount_value is required for percentage discount",
    }
  )
  .refine(
    (data) =>
      data.discount_type !== "percentage" ||
      (data.min_discount_value ?? 0) <= (data.max_discount_value ?? 0),
    {
      path: ["min_discount_value"],
      message: "min_discount_value cannot be greater than max_discount_value",
    }
  );

export type CreateCouponSchema = z.infer<typeof createCouponSchema>;

export const couponIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type CouponIdParamsSchema = z.infer<typeof couponIdParamsSchema>;

export const updateCouponSchema = z
  .object({
    description: z.string().min(1).optional(),
    discount_type: z.enum(["percentage", "fixed"]), // Now mandatory
    discount_value: z.number().min(0).optional(),
    min_discount_value: z.number().min(0).optional(),
    max_discount_value: z.number().min(0).optional(),
    is_active: z.boolean().optional(),
    min_order_value: z.number().min(0).optional(),
    usage_limit_per_user: z.number().min(1).optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.description !== undefined ||
      data.is_active !== undefined ||
      data.usage_limit_per_user !== undefined ||
      data.start_date !== undefined ||
      data.end_date !== undefined ||
      data.min_order_value !== undefined ||
      data.discount_value !== undefined ||
      data.min_discount_value !== undefined ||
      data.max_discount_value !== undefined,
    {
      message: "At least one field must be provided",
      path: [],
    }
  )
  .refine(
    (data) =>
      data.start_date == undefined ||
      data.end_date == undefined ||
      data.start_date < data.end_date,
    {
      path: ["start_date"],
      message: "start_date must be before end_date when both are provided",
    }
  )
  .refine((data) => data.end_date == undefined || data.end_date > new Date(), {
    path: ["end_date"],
    message: "end_date must be a future date",
  })
  .refine(
    (data) =>
      data.discount_value == undefined ||
      (data.discount_type == "percentage" &&
        data.discount_value <= 100 &&
        data.discount_value >= 0),
    {
      message:
        "For percentage discount, discount_value must be between 0 and 100",
      path: ["discount_value"],
    }
  )
  .refine(
    (data) =>
      data.min_discount_value == undefined ||
      data.max_discount_value == undefined ||
      (data.discount_type == "percentage" &&
        (data.min_discount_value ?? 0) <= (data.max_discount_value ?? 0)),
    {
      path: ["min_discount_value"],
      message: "min_discount_value cannot be greater than max_discount_value",
    }
  );

export type UpdateCouponSchema = z.infer<typeof updateCouponSchema>;
