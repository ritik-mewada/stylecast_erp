/**
 * Typed application error.
 *
 * Throw this from services and middleware so the global error handler can
 * distinguish operational errors (4xx/5xx with a known status code) from
 * unexpected programming bugs.
 *
 * Usage:
 *   throw new AppError(404, "Product not found");
 *   throw new AppError(409, "Email already in use");
 *   throw new AppError(409, "Insufficient stock", { items });  // details are sent to the client
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    message: string,
    details?: Record<string, unknown>,
    isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
