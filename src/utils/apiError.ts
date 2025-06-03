export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly success: boolean;
  public readonly details?: { field: string; message: string }[];

  constructor(
    message: string,
    statusCode: number,
    error: string,
    details?: { field: string; message: string }[]
  ) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.success = false;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
