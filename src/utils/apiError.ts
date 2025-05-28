export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly error: string;
  public readonly success: boolean;

  constructor(message: string, statusCode: number, error: string) {
    super(message);

    this.statusCode = statusCode;
    this.error = error;
    this.success = false;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
