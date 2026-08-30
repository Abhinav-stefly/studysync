import "dotenv/config";
import { generateStudyPlanFromAI } from "../modules/ai/ai.service.js";

const result = await generateStudyPlanFromAI({ goal: "SDE interview prep", durationDays: 5 });
console.log(JSON.stringify(result, null, 2));