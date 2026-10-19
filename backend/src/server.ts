import "dotenv/config";

import http from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { initSocketServer } from "./sockets/index.js";
import { logger } from "./config/logger.js";
import "./config/llm.js";
import { registerWeeklyReportSchedule } from "./jobs/scheduleWeeklyReports.js";
import { startReportWorker } from "./workers/startReportWorker.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  connectRedis();

  registerWeeklyReportSchedule().catch((err) =>
    logger.error({ err }, "Failed to register weekly report schedule")
  );

  if (process.env.RUN_WORKER === "true") {
    startReportWorker();
  }

  const httpServer = http.createServer(app);
  initSocketServer(httpServer);

  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();