import "dotenv/config";
import { generateStudyPlanFromAI } from "../modules/ai/ai.service.js";
import { logger } from "../config/logger.js";
const result = await generateStudyPlanFromAI({ goal: "SDE interview prep", durationDays: 5 });
logger.info(JSON.stringify(result, null, 2));