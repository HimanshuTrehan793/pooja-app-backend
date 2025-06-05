import { z } from "zod";

export const getCategoryQuerySchema = z.object({
  page: z.preprocess((val) => Number(val), z.number().min(1).default(1)),
  limit: z.preprocess(
    (val) => Number(val),
    z.number().min(1).max(100).default(30)
  ),
  q: z.string().optional(),
});

export const categoryIdParamSchema = z.object({
  id: z.string().uuid("Invalid product ID"),
});

export type CategoryQueryParams = z.infer<typeof getCategoryQuerySchema>;
export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>;

// Category validation schema
export const categoryValidation = z.object({
  name: z.string().min(3).max(30),
  image: z.string().url().nonempty(),
});
