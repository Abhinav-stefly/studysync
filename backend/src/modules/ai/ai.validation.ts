import { z } from "zod";
import mongoose from "mongoose";
// Job 1: validate the incoming HTTP request
export const generateStudyPlanSchema = z.object({
  goal: z
    .string()
    .trim()
    .min(5, "Goal must be at least 5 characters")
    .max(200, "Goal must be under 200 characters"),
  durationDays: z.coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 day")
    .max(90, "Duration cannot exceed 90 days"), // hard ceiling — also a cost control lever
});

export type GenerateStudyPlanInput = z.infer<typeof generateStudyPlanSchema>;

// Job 3: validate the LLM's tool-call output before we trust it
export const aiPlanTaskSchema = z.object({
  day: z.number().int().min(1),
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().min(1).max(500),
});

export const aiPlanOutputSchema = z.object({
  title: z.string().trim().min(1).max(150),
  tasks: z.array(aiPlanTaskSchema).min(1, "Plan must contain at least one task"),
});

export type AiPlanOutput = z.infer<typeof aiPlanOutputSchema>;

// Cross-field sanity check: no task should reference a day beyond the requested duration.
// This lives OUTSIDE the base schema because durationDays isn't part of the LLM's output —
// it's the input we gave it. We validate the LLM stayed inside the box we asked for.
export const validatePlanWithinDuration = (
  plan: AiPlanOutput,
  durationDays: number
): void => {
  const invalidTask = plan.tasks.find((t) => t.day > durationDays);
  if (invalidTask) {
    throw new Error(
      `LLM returned a task on day ${invalidTask.day}, exceeding requested duration of ${durationDays} days`
    );
  }
};



export const explainResourceSchema = z.object({
  resourceType: z.enum(["note", "problem"]),
  resourceId: z.string().refine(
    (val) => mongoose.Types.ObjectId.isValid(val),
    { message: "resourceId must be a valid MongoDB ObjectId" }
  ),
});
export type ExplainResourceInput = z.infer<typeof explainResourceSchema>;

export const aiExplanationOutputSchema = z.object({
  explanation: z.string().trim().min(1),
  intuition: z.string().trim().min(1),
  complexity: z.string().trim().min(1),
  commonMistakes: z.array(z.string().trim().min(1)).min(1),
});

export type AiExplanationOutput = z.infer<typeof aiExplanationOutputSchema>;