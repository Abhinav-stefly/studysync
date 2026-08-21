import { Request, Response, NextFunction } from "express";
import { getRedisClient } from "../config/redis.js";
import { AppError } from "./errorHandler.js";

interface RateLimitOptions {
  windowSeconds: number;
  maxRequests: number;
  keyPrefix: string;
}

export const rateLimiter = (options: RateLimitOptions) => {
  const { windowSeconds, maxRequests, keyPrefix } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const redis = getRedisClient();

    // Identify the requester: prefer authenticated user, fall back to IP
    const identifier = (req as any).user?.userId || req.ip;
    const key = `ratelimit:${keyPrefix}:${identifier}`;

    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, windowSeconds);
    }

    if (count > maxRequests) {
      return next(new AppError("Too many requests, please try again later", 429));
    }

    next();
  };
};