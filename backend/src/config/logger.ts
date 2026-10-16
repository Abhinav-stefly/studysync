import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isProduction
    ? undefined // raw JSON in production — what log aggregators expect
    : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
});