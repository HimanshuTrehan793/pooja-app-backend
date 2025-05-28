import { Response } from "express";

interface SendResponseParams<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export function sendResponse<T>({
  res,
  statusCode = 200,
  message,
  data,
  pagination,
}: SendResponseParams<T>) {
  const responseBody: any = {
    success: true,
    message,
  };

  if (data !== undefined && data !== null) {
    responseBody.data = data;
  }

  if (pagination !== undefined && pagination !== null) {
    responseBody.pagination = pagination;
  }

  return res.status(statusCode).json(responseBody);
}
