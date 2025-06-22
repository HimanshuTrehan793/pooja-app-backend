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
      message: "Invalid phone number format (E.164 expected)",
    }),

    name: z.string().min(1, "Name is required"),

    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    landmark: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z
      .string()
      .regex(/^\d{5,6}$/, { message: "Invalid pincode format" })
      .optional(),
  })
  .strict();
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
