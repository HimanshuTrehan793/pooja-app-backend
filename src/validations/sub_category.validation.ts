import { z } from "zod";

export const getSubCategroyQuerySchema = z.object({
  parent_ids: z
    .preprocess(
      (val) => (typeof val === "string" ? val.split(",") : val),
      z.array(z.string().uuid())
    )
    .optional(),
});

export type SubCategoryQueryParams = z.infer<typeof getSubCategroyQuerySchema>;

export const createSubCategorySchema = z
  .object({
    name: z.string().min(3).max(30),
    image: z.string().url().nonempty(),
    parent_id: z.string().uuid().optional(),
  })
  .strict();

export type CreateSubCategoryInput = z.infer<typeof createSubCategorySchema>;

export const subCategoryIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type SubCategoryIdParam = z.infer<typeof subCategoryIdParamSchema>;

export const updateSubCategorySchema = z
  .object({
    name: z.string().min(3).max(30).optional(),
    image: z.string().url().nonempty().optional(),
  })
  .strict()
  .refine((data) => data.name !== undefined || data.image !== undefined, {
    message: "At least one field (name or image) must be provided.",
  });

export type UpdateSubCategoryInput = z.infer<typeof updateSubCategorySchema>;
