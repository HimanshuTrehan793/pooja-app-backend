// src/middlewares/jsonSyntaxErrorHandler.ts
import { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "../constants/httpStatusCodes";
import { getEnvVar } from "../utils/getEnvVar";

export function jsonSyntaxErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (
    err instanceof SyntaxError &&
    "status" in err &&
    (err as any).status === 400 &&
    "body" in err
  ) {
    res.status(HttpStatusCode.BAD_REQUEST).json({
      success: false,
      message: "Invalid or empty JSON payload",
      error: "Bad Request",
      ...(getEnvVar("NODE_ENV") === "development" && {
        stack: (err as Error).stack,
      }),
    });
    return;
  }

  next(err);
}
