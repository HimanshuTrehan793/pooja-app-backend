import { z } from "zod";

const phoneSchema = z.string().regex(/^\+[1-9]\d{1,14}$/, {
  message: `"phone_number" must be in valid E.164 format (e.g., +919876543210)`,
});

const otpCodeSchema = z.string().regex(/^\d{6}$/, {
  message: `"otp_code" must be a 6-digit number`,
});

export const sendOtpSchema = z.object({
  phone_number: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phone_number: phoneSchema,
  otp_code: otpCodeSchema,
  device_info: z
    .object({
      device_name: z.string().optional(),
      browser: z.string().optional(),
      os: z.string().optional(),
      device_type: z.string().optional(),
    })
    .optional(),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
