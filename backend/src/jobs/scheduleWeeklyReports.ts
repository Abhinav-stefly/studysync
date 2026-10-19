import { reportQueue } from "./reportQueue.js";
import { logger } from "../config/logger.js";

export const SCHEDULE_ALL_JOB = "schedule-all-reports";

// One schedule for the whole system. The stable ID means calling this on
// every boot updates the same entry instead of creating a duplicate.
export const registerWeeklyReportSchedule = async () => {
  await reportQueue.upsertJobScheduler(
    "weekly-report-fanout",
    { pattern: "0 0 * * 0" }, // Sunday 00:00 (UTC on Render)
    { name: SCHEDULE_ALL_JOB, data: {} }
  );
  logger.info("Weekly report schedule registered");
};