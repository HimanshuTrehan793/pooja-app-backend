import { z } from "zod";

export const configurationSchema = z.object({
  phone_number: z.string().min(10).max(20).optional(), // adjust as per your format
  whatsapp_number: z.string().min(10).max(20).optional(),
  store_status: z.boolean(),
  min_order_amount: z.number().min(0),
  delivery_charge: z.number().min(0),
  delivery_time: z.number().min(0),
  ad_banner_images: z.array(z.string().url()).optional(),
  announcement_text: z.string().optional(),
});



export type ConfigurationInput = z.infer<typeof configurationSchema>;

// For PATCH (update), allow partials, but at least one field should be present:
export const updateConfigurationSchema = configurationSchema
  .partial()
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    { message: "At least one field must be provided for update." }
  );

export type UpdateConfigurationInput = z.infer<typeof updateConfigurationSchema>;



