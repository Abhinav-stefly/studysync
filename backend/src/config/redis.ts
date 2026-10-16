import { Redis } from "ioredis";
import { logger } from "./logger.js";
let redisClient: Redis | null = null;

export const connectRedis = (): Redis => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }

  redisClient = new Redis(redisUrl);

  redisClient.on("connect", () => {
    logger.info("Redis connected successfully");
  });

  redisClient.on("error", (err) => {
   logger.error({ err }, "Redis connection error");
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error("Redis client not initialized. Call connectRedis() first.");
  }
  return redisClient;
};