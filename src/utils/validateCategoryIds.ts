import { z } from "zod";
import { Category } from "../models/category.model";

/**
 * Validates if all category IDs exist in the database.
 * Adds a custom issue to Zod if any are missing.
 */
export async function validateCategoryIds(
  categoryIds: string[],
  path: (string | number)[],
  ctx: z.RefinementCtx
) {
  const uniqueIds = Array.from(new Set(categoryIds));

  const existingCategories = await Category.findAll({
    where: { id: uniqueIds },
    attributes: ["id"],
  });

  const existingIds = new Set(existingCategories.map((c) => c.id));
  const missingIds = uniqueIds.filter((id) => !existingIds.has(id));

  if (missingIds.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `Invalid category_ids: ${missingIds.join(", ")}`,
    });
  }
}
