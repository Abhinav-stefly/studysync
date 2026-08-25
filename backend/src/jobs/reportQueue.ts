import { Queue } from "bullmq";
import { createBullMQConnection } from "../config/queue.js";

export interface ReportJobData {
  userId: string;
}

export const reportQueue = new Queue<ReportJobData>("report-generation", {
  connection: createBullMQConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});