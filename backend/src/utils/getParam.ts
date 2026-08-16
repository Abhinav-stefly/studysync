import { AppError } from "../middleware/errorHandler.js";

export const getParam = (value: string | string[] | undefined): string => {
  if (typeof value !== "string") {
    throw new AppError("Invalid route parameter", 400);
  }
  return value;
};