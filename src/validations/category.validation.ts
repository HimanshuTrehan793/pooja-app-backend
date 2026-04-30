import { z } from "zod";

export const getCategoryQuerySchema = z
  .object({
    page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
    limit: z.preprocess(
      (val) => Number(val),
      z.number().min(1).max(100).default(30)
    ),
    q: z.string().optional(),
    sort_by: z
      .enum(["priority", "name", "created_at", "updated_at"])
      .optional(),
    sort_order: z.enum(["ASC", "DESC"]).optional(),
  })
  .refine(
    (data) => (data.sort_by !== undefined) === (data.sort_order !== undefined),
    {
      message:
        "Both sort_by and sort_order must be provided together, or neither should be provided",
    }
  );

export type CategoryQueryParams = z.infer<typeof getCategoryQuerySchema>;

export const categoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;

export const createCategorySchema = z
  .object({
    name: z.string().min(3).max(30),
    image: z.string().url().nonempty(),
  })
  .strict();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z
  .object({
    name: z.string().min(3).max(30).optional(),
    image: z.string().url().optional(),
    priority: z
      .number()
      .positive("Priority must be a positive number")
      .finite("Priority must be a finite number")
      .refine((val) => val <= 9999999999.9999999999, {
        message:
          "Priority exceeds maximum allowed value (9999999999.9999999999)",
      })
      // DB column is DECIMAL(20, 10). Round client-side float noise so values
      // like 30212.82958984375 don't get rejected — Postgres would round
      // them anyway.
      .transform((val) => Math.round(val * 1e10) / 1e10)
      .optional(),
  })
  .strict()
  .refine(
    (data) =>
      data.name !== undefined ||
      data.image !== undefined ||
      data.priority !== undefined,
    {
      message:
        "At least one field (name, image, or priority) must be provided.",
    }
  );

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
