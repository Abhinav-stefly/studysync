import pino from "pino";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// pino-pretty is a devDependency, so it's absent from the production image.
// Only use it when we're not in production AND it's actually installed.
const hasPretty = (() => {
  try {
    require.resolve("pino-pretty");
    return true;
  } catch {
    return false;
  }
})();

const usePretty = process.env.NODE_ENV !== "production" && hasPretty;

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: usePretty
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } }
    : undefined,
});