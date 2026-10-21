/**
 * Central error-handling middleware.
 *
 * Placed after all routes in app.ts.  Catches anything passed to `next(err)`:
 *  - AppError instances  → use their statusCode + message (operational errors),
 *                          plus `details` when the error carries them.
 *  - Postgres unique violations (a race the service checks missed) → 409.
 *  - Postgres invalid input (e.g. a bad enum value in a query string) → 400.
 *  - Unknown errors      → 500 Internal Server Error (bugs / unexpected failures).
 *
 * In production the raw error detail is not leaked to the client.
 */
import { Request, Response, NextFunction } from "express";
import { QueryFailedError } from "typeorm";
import { AppError } from "../utils/AppError";
import { Config } from "../config";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isDev = Config.NODE_ENV === "development";

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      ...(err.details && { details: err.details }),
    });
    return;
  }

  if (err instanceof QueryFailedError) {
    const code = (err.driverError as { code?: string } | undefined)?.code;
    if (code === "23505") {
      res.status(409).json({
        status: "error",
        message: "A record with these details already exists",
      });
      return;
    }
    if (code === "22P02") {
      res.status(400).json({ status: "error", message: "Invalid value in request" });
      return;
    }
  }

  // Unknown / unexpected error
  const message = err instanceof Error ? err.message : "An unexpected error occurred";

  if (isDev) {
    // Expose stack trace in development for easier debugging
    const stack = err instanceof Error ? err.stack : undefined;
    console.error("💥 Unhandled error:", err);
    res.status(500).json({ status: "error", message, stack });
    return;
  }

  // Production: log full error internally, return generic message externally
  console.error("💥 Unhandled error:", err);
  res.status(500).json({ status: "error", message: "Internal server error" });
};
