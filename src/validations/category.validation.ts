import { z } from "zod";

export const getCategoryQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(30)
  ),
  q: z.string().optional(),
});

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
  })
  .strict()
  .refine((data) => data.name !== undefined || data.image !== undefined, {
    message: "At least one field (name or image) must be provided.",
  });

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
