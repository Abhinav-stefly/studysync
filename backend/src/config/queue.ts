import { Redis } from "ioredis";

export const createBullMQConnection = () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    throw new Error("REDIS_URL is not defined in environment variables");
  }

  return new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });
};