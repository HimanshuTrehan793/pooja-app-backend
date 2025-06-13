import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

export const schemaValidate =
  <T>(schema: ZodSchema<T>, source: "body" | "params" = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const raw = source === "params" ? req.params : req.body;

    if (raw === null || raw === undefined || typeof raw !== "object") {
      throw new ApiError(
        `Request ${source} is missing or not a valid object`,
        HttpStatusCode.BAD_REQUEST,
        "Validation Error"
      );
    }

    const result = schema.safeParse(raw);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.length > 0 ? err.path.join(".") : source,
        message: err.message,
      }));

      throw new ApiError(
        "Validation failed",
        HttpStatusCode.BAD_REQUEST,
        "Validation Error",
        details
      );
    }

    switch (source) {
      case "params":
        Object.assign(req.params, result.data);
        break;
      default:
        Object.assign(req.body, result.data);
    }

    next();
  };
