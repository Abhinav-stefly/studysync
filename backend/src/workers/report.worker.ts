import "dotenv/config";

import { Worker, Job } from "bullmq";
import { createBullMQConnection } from "../config/queue.js";
import { connectDB } from "../config/db.js";
import { ReportJobData } from "../jobs/reportQueue.js";
import { generateWeeklyReport } from "../modules/analytics/analytics.service.js";
// ...rest unchanged

const processReportJob = async (job: Job<ReportJobData>) => {
  console.log(`Processing report job ${job.id} for user ${job.data.userId}`);

  const report = await generateWeeklyReport(job.data.userId);

  console.log(`Finished report job ${job.id}`);
  return { status: "completed", reportId: report._id };
};


const startWorker = async () => {
  await connectDB(); // worker needs its own DB connection — it's a separate process

  const worker = new Worker<ReportJobData>("report-generation", processReportJob, {
    connection: createBullMQConnection(),
    concurrency: 2, // process up to 2 jobs at once
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message);
  });

  console.log("Report worker started, waiting for jobs...");
};

startWorker();