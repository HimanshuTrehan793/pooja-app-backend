import { z } from "zod";

export const registerDeviceSchema = z.object({
  device_token: z.string().min(1),
  device_type: z.enum(["android", "ios", "web"]),
});

export type RegisterDeviceSchema = z.infer<typeof registerDeviceSchema>;


export const deactivateDeviceSchema = z.object({
  device_token: z.string().min(1),
});

export type DeactivateDeviceSchema = z.infer<typeof deactivateDeviceSchema>;