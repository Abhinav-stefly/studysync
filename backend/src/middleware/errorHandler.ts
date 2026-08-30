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
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} -> Validation failed`);
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

 

// inside errorHandler, before the generic AppError/500 branch:
if (err instanceof mongoose.Error.CastError) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> Invalid ID format`);
  res.status(400).json({
    success: false,
    message: "Invalid resource ID format",
  });
  return;
}
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  console.error(`[ERROR] ${req.method} ${req.originalUrl} -> ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
  });
};