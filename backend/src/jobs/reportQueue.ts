import { Queue } from "bullmq";
import { createBullMQConnection } from "../config/queue.js";

export interface ReportJobData {
  userId: string;
  period?: "current" | "previous";
}

// The weekly schedule fires a job with no payload; the worker then fans out
// into one ReportJobData job per user.
export type FanOutJobData = Record<string, never>;

export type ReportQueueData = ReportJobData | FanOutJobData;

export const reportQueue = new Queue<ReportQueueData>("report-generation", {
  connection: createBullMQConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600 },
    removeOnFail: { age: 86400 },
  },
});