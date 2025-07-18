import { z } from "zod";

export const getSubCategroyQuerySchema = z
  .object({
    parent_ids: z.string().optional(),
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
