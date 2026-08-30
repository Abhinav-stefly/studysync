import { Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AuthenticatedRequest } from "../../middleware/auth.js"; // adjust to your actual type location
import { generateStudyPlanSchema } from "./ai.validation.js";
import { generateStudyPlanFromAI } from "./ai.service.js";
import { Note } from "../notes/note.model.js";
import { Problem } from "../problems/problem.model.js";
import { explainResourceSchema } from "./ai.validation.js";
import { generateExplanationFromAI } from "./ai.service.js";
import { AppError } from "../../middleware/errorHandler.js";

export const explainResource = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { resourceType, resourceId } = explainResourceSchema.parse(req.body);
    const userId = req.user!.userId; // adjust to however your AuthenticatedRequest names this

    let context: { source: "note" | "problem"; title: string; body: string };

    if (resourceType === "note") {
      const note = await Note.findOne({ _id: resourceId, userId });
      if (!note) {
        throw new AppError("Note not found", 404); // IDOR pattern: 404, not 403
      }
      context = { source: "note", title: note.title, body: note.content };
    } else {
      const problem = await Problem.findOne({ _id: resourceId, userId });
      if (!problem) {
        throw new AppError("Problem not found", 404);
      }
      context = {
        source: "problem",
        title: problem.title,
        body: `Title: ${problem.title}\nTopic: ${problem.topic}\nDifficulty: ${problem.difficulty}\nTags: ${problem.tags.join(", ")}`,
      };
    }

    const explanation = await generateExplanationFromAI(context);

    res.status(200).json({ success: true, data: explanation });
  }
);

export const previewStudyPlan = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const input = generateStudyPlanSchema.parse(req.body);

    const plan = await generateStudyPlanFromAI(input);

    res.status(200).json({
      success: true,
      data: plan,
    });
  }
);