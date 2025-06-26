import { z } from "zod";

export const updateUserBodySchema = z
  .object({
    first_name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name is too long")
      .optional(),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name is too long")
      .optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
  })
  .refine(
    (data) =>
      data.first_name !== undefined ||
      data.last_name !== undefined ||
      data.gender !== undefined,
    {
      message: "At least one field must be provided",
    }
  );
export type UpdateUserBodySchema = z.infer<typeof updateUserBodySchema>;

export const sendOtpToUpdateEmailSchema = z.object({
  email: z.string().email("Invalid email format").max(100, "Email is too long"),
});

export type SendOtpToUpdateEmailSchema = z.infer<
  typeof sendOtpToUpdateEmailSchema
>;

export const updateEmailBodySchema = z.object({
  email: z.string().email("Invalid email format").max(100, "Email is too long"),
  otp_code: z.string().length(6, "OTP must be 6 digits"),
});

export type UpdateEmailBodySchema = z.infer<typeof updateEmailBodySchema>;
