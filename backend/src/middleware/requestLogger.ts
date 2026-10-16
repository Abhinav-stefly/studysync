import { pinoHttp } from "pino-http";
import { logger } from "../config/logger.js";

export const requestLogger = pinoHttp({
  logger,

  // Don't log health-check pings. Render hits this endpoint constantly,
  // and it would bury every real request in noise.
  autoLogging: {
    ignore: (req) => req.url === "/api/health",
  },

  // Severity follows the outcome, so you can filter by level in production.
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  // Allowlist, not denylist: we log only the fields listed here.
  // Headers are never logged, so Authorization and Cookie can't leak.
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});