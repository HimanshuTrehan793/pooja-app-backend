import z from "zod";

export const getLocationQuerySchema = z.object({
  lat: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
  ),
  lng: z.preprocess(
    (val) => Number(val),
    z
      .number()
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
  ),
});

export const getSearchLocationQuerySchema = z.object({
  search: z.string().min(1).max(20),
});

export type LocationQueryParams = z.infer<typeof getLocationQuerySchema>;
export type SearchLocationQueryParams = z.infer<
  typeof getSearchLocationQuerySchema
>;

export const createAddressSchema = z
  .object({
    phone_number: z.string().regex(/^\+[1-9]\d{1,14}$/, {
      message: `"phone_number" must be in valid E.164 format (e.g., +919876543210)`,
    }),
    name: z.string().min(1),
    city: z.string().min(1).max(50),
    state: z.string().min(1).max(50),
    pincode: z.string().regex(/^\d{6}$/, { message: "Invalid pincode format" }),
    address_line1: z.string().min(10),
    address_line2: z.string().min(10),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    landmark: z.string().nullable().optional().default(null),
  })
  .strict();

export type createAddressSchema = z.infer<typeof createAddressSchema>;

export const addressIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type AddressIdParamsSchema = z.infer<typeof addressIdParamsSchema>;

export const updateAddressSchema = z
  .object({
    phone_number: z
      .string()
      .regex(/^\+[1-9]\d{1,14}$/, {
        message: `"phone_number" must be in valid E.164 format (e.g., +919876543210)`,
      })
      .optional(),
    name: z.string().min(1).optional(),
    city: z.string().min(1).max(50).optional(),
    state: z.string().min(1).max(50).optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, { message: "Invalid pincode format" })
      .optional(),
    address_line1: z.string().min(10).optional(),
    address_line2: z.string().min(10).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    landmark: z.string().nullable().optional().default(null),
  })
  .strict()
  .refine(
    (data) =>
      data.phone_number !== undefined ||
      data.name !== undefined ||
      data.city !== undefined ||
      data.state !== undefined ||
      data.pincode !== undefined ||
      data.address_line1 !== undefined ||
      data.address_line2 !== undefined ||
      data.lat !== undefined ||
      data.lng !== undefined ||
      data.landmark !== undefined,
    {
      message: "At least one field must be provided for update.",
    }
  );

export type UpdateAddressSchema = z.infer<typeof updateAddressSchema>;