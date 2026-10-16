import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import mongoose from "mongoose";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ success: false, message: "Invalid resource ID format" });
    return;
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  // 4xx errors are already logged at "warn" by pino-http's completion line.
  // Only 5xx need the stack trace here, and logging both would double up.
  if (statusCode >= 500) {
    req.log.error({ err }, "Request failed");
  }

  res.status(statusCode).json({
    success: false,
    // Expected errors (AppError) have messages written for clients.
    // Anything else is an unexpected crash, and its message could expose internals.
    message: isAppError ? err.message : "Internal Server Error",
  });
};