import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/apiError";
import { getEnvVar } from "../utils/getEnvVar";
import { HttpStatusCode } from "../constants/httpStatusCodes";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      error: err.error,
      ...(getEnvVar("NODE_ENV") === "development" && { stack: err.stack }),
    });
    return;
  }

  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong",
    error: "Internal Server Error",
    ...(getEnvVar("NODE_ENV") === "development" && { stack: err.stack }),
  });
};
