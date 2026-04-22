import { z } from "zod";

export const broadcastNotificationSchema = z.object({
  title: z.string().min(1, "title is required").max(120),
  body: z.string().min(1, "body is required").max(500),
  data: z.record(z.string(), z.string()).optional(),
});
