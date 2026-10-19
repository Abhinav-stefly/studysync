import { Worker, Job } from "bullmq";
import { createBullMQConnection } from "../config/queue.js";
import { reportQueue, type ReportJobData, type ReportQueueData } from "../jobs/reportQueue.js";
import { SCHEDULE_ALL_JOB } from "../jobs/scheduleWeeklyReports.js";
import { generateWeeklyReport } from "../modules/analytics/analytics.service.js";
import { User } from "../modules/users/user.model.js";
import { logger } from "../config/logger.js";

const isReportJob = (data: ReportQueueData): data is ReportJobData => {
  const { userId } = data as Partial<ReportJobData>;
  return typeof userId === "string" && userId.length > 0;
};

const processJob = async (job: Job<ReportQueueData>) => {
  if (job.name === SCHEDULE_ALL_JOB) {
    const users = await User.find().select("_id");
    await reportQueue.addBulk(
      users.map((u) => ({
  name: "generate-report",
  data: { userId: u._id.toString(), period: "previous" as const },
}))
    );
    logger.info({ jobId: job.id, userCount: users.length }, "Fanned out weekly reports");
    return { status: "fanned-out", userCount: users.length };
  }

  if (!isReportJob(job.data)) {
    throw new Error("generate-report job is missing userId");
  }
  const { userId } = job.data;

  logger.info({ jobId: job.id, userId }, "Processing report job");
  const report = await generateWeeklyReport(userId, job.data.period);
  return { status: "completed", reportId: report._id };
};

export const startReportWorker = () => {
  const worker = new Worker<ReportQueueData>("report-generation", processJob, {
    connection: createBullMQConnection(),
    concurrency: 2,
  });

  worker.on("completed", (job) => logger.info({ jobId: job.id, name: job.name }, "Job completed"));
  worker.on("failed", (job, err) => logger.error({ jobId: job?.id, err }, "Job failed"));

  logger.info("Report worker started");
  return worker;
};