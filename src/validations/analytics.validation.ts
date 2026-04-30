import { z } from "zod";

const isoDate = z
  .string()
  .refine((v) => !Number.isNaN(Date.parse(v)), { message: "Invalid ISO date" });

export const analyticsRangeSchema = z
  .object({
    from: isoDate,
    to: isoDate,
    limit: z.preprocess(
      (v) => (v === undefined ? undefined : Number(v)),
      z.number().int().min(1).max(500).optional()
    ),
  })
  .refine((d) => new Date(d.from) <= new Date(d.to), {
    message: "`from` must be on or before `to`",
  });

export type AnalyticsRangeQuery = z.infer<typeof analyticsRangeSchema>;
