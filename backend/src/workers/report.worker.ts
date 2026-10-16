import "dotenv/config";

import { Worker, Job } from "bullmq";
import { createBullMQConnection } from "../config/queue.js";
import { connectDB } from "../config/db.js";
import { ReportJobData } from "../jobs/reportQueue.js";
import { generateWeeklyReport } from "../modules/analytics/analytics.service.js";
import { logger } from "../config/logger.js";
// ...rest unchanged

const processReportJob = async (job: Job<ReportJobData>) => {
  logger.info(`Processing report job ${job.id} for user ${job.data.userId}`);

  const report = await generateWeeklyReport(job.data.userId);

  logger.info(`Finished report job ${job.id}`);
  return { status: "completed", reportId: report._id };
};


const startWorker = async () => {
  await connectDB(); // worker needs its own DB connection — it's a separate process

  const worker = new Worker<ReportJobData>("report-generation", processReportJob, {
    connection: createBullMQConnection(),
    concurrency: 2, // process up to 2 jobs at once
  });

  worker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

worker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, err },
    "Job failed"
  );
});

  logger.info("Report worker started, waiting for jobs...");
};

startWorker();