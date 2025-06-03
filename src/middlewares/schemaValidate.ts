import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";

export const schemaValidate =
  <T>(schema: ZodSchema<T>, source: "body" | "query" | "params" = "body") =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const raw =
      source === "query"
        ? req.query
        : source === "params"
        ? req.params
        : req.body;

    if (raw === null || raw === undefined || typeof raw !== "object") {
      return next(
        new ApiError(
          `Request ${source} is missing or not a valid object`,
          HttpStatusCode.BAD_REQUEST,
          "Validation Error"
        )
      );
    }

    const result = await schema.safeParseAsync(raw);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.length > 0 ? err.path.join(".") : source,
        message: err.message,
      }));

      return next(
        new ApiError(
          "Validation failed",
          HttpStatusCode.BAD_REQUEST,
          "Validation Error",
          details
        )
      );
    }

    switch (source) {
      case "query":
        Object.assign(req.query, result.data);
        break;
      case "params":
        Object.assign(req.params, result.data);
        break;
      default:
        Object.assign(req.body, result.data);
    }

    next();
  };
