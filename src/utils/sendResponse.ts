import { Response } from "express";

interface SendResponseParams<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
  meta?: {
    totalItems: number; 
    totalPages: number; 
    currentPage: number;
    nextPage?: number;
    prevPage?: number;
    pageSize: number;
  };
}

export function sendResponse<T>({
  res,
  statusCode = 200,
  message,
  data,
  meta,
}: SendResponseParams<T>) {
  const responseBody: any = {
    success: true,
    message,
  };

  if (data !== undefined && data !== null) {
    responseBody.data = data;
  }

  if (meta !== undefined && meta !== null) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
}
