import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";
import { verifyAccessToken } from "../modules/auth/token.utils.js";

export interface AuthenticatedRequest extends Request {
  user?: { userId: string; role: string };
}

export const protect = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Not authenticated", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};