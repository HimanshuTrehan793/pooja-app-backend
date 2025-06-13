import { ZodSchema } from "zod";
import { ApiError } from "./apiError";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { ParsedQs } from "qs";

export const parseQueryParams = <T>(
  schema: ZodSchema<T>,
  query: ParsedQs
): T => {
  const result = schema.safeParse(query);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.length > 0 ? err.path.join(".") : "query",
      message: err.message,
    }));

    throw new ApiError(
      "Validation Error",
      HttpStatusCode.BAD_REQUEST,
      "Invalid query parameters",
      details
    );
  }

  return result.data;
};
