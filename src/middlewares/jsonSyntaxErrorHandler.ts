import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { HTTP_STATUS_CODES } from "../constants/httpsStatusCodes";

export function jsonSyntaxErrorHandler(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    return next(
      new ApiError(
        "Invalid or malformed JSON in request body",
        HTTP_STATUS_CODES.BAD_REQUEST,
        "invalid_json_syntax"
      )
    );
  }

  next(err);
}
