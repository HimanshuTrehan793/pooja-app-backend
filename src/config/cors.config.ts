import { CorsOptions, CorsOptionsDelegate } from "cors";
import { Request } from "express";
import { getEnvVar } from "../utils/getEnvVar";

const allowedOrigins: string[] = getEnvVar("ALLOWED_ORIGINS")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions: CorsOptionsDelegate<Request> = (req, callback) => {
  let corsOptions: CorsOptions;
  const origin = req.header("Origin") || "";

  const isDomainAllowed = allowedOrigins.includes(origin);

  if (isDomainAllowed) {
    corsOptions = { origin: true, credentials: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};
