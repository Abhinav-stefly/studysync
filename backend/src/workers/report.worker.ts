import "dotenv/config";
import { connectDB } from "../config/db.js";
import { startReportWorker } from "./startReportWorker.js";

const main = async () => {
  await connectDB();
  startReportWorker();
};

main();