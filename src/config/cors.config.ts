// utils/corsOptions.ts

import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Request } from "express";
import dotenv from "dotenv";
import { getEnvVar } from "../utils/getEnvVar";

dotenv.config(); // Load .env values

// Parse allowed origins from env (comma-separated list)
const allowedOrigins: string[] = getEnvVar("ALLOWED_ORIGINS")
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

export const corsOptions: CorsOptionsDelegate<Request> = (req, callback) => {
  let corsOptions: CorsOptions;
  const origin = req.header("Origin") || "";

  const isDomainAllowed = allowedOrigins.includes(origin);

  if (isDomainAllowed) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};
