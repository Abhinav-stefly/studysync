import { llmClient, LLM_MODEL } from "../../config/llm.js";
import {
  aiPlanOutputSchema,
  validatePlanWithinDuration,
  aiExplanationOutputSchema,
  type GenerateStudyPlanInput,
  type AiExplanationOutput,
} from "./ai.validation.js";
import { AppError } from "../../middleware/errorHandler.js"; // adjust path to your actual AppError location

const studyPlanToolSchema = {
  type: "function" as const,
  function: {
    name: "create_study_plan",
    description: "Create a structured day-by-day study plan for interview preparation.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "A short title for the overall plan, e.g. '30-Day SDE Interview Prep'",
        },
        tasks: {
          type: "array",
          description: "One or more tasks, ordered by day",
          items: {
            type: "object",
            properties: {
              day: { type: "integer", description: "Which day of the plan this task falls on, starting at 1" },
              title: { type: "string", description: "Short task title" },
              description: { type: "string", description: "1-2 sentence description of what to do" },
            },
            required: ["day", "title", "description"],
          },
        },
      },
      required: ["title", "tasks"],
    },
  },
};
export const generateStudyPlanFromAI = async (
  input: GenerateStudyPlanInput
): Promise<{ title: string; tasks: { day: number; title: string; description: string }[] }> => {
  const { goal, durationDays } = input;

  const completion = await llmClient.chat.completions.create({
    model: LLM_MODEL,
    temperature: 0.3, // low — we want consistent, sane plans, not creative variation
    max_tokens: 2000, // hard ceiling — direct cost control lever
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interview coach. Create realistic, well-paced study plans. " +
          "Every task must fall on a day between 1 and the requested duration, inclusive. " +
          "Do not skip days arbitrarily; distribute tasks sensibly across the full duration.",
      },
      {
        role: "user",
        content: `Create a ${durationDays}-day study plan for this goal: "${goal}"`,
      },
    ],
    tools: [studyPlanToolSchema],
    tool_choice: { type: "function" as const, function: { name: "create_study_plan" } },
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];
if (!toolCall || toolCall.type !== "function") {
  throw new AppError("AI service did not return a structured response", 502);
}
  if (!toolCall) {
    throw new AppError("AI service did not return a structured response", 502);
  }

  let rawArgs: unknown;
  try {
    rawArgs = JSON.parse(toolCall.function.arguments);
  } catch {
    throw new AppError("AI service returned malformed JSON", 502);
  }

  const parseResult = aiPlanOutputSchema.safeParse(rawArgs);
  if (!parseResult.success) {
    throw new AppError("AI service returned an invalid plan structure", 502);
  }

  const plan = parseResult.data;

  try {
    validatePlanWithinDuration(plan, durationDays);
  } catch (err) {
    throw new AppError((err as Error).message, 502);
  }
  return plan;
};

const explainToolSchema = {
  type: "function" as const,
  function: {
    name: "provide_explanation",
    description: "Provide a structured explanation of a study note or interview problem.",
    parameters: {
      type: "object",
      properties: {
        explanation: { type: "string", description: "A clear explanation of the core concept" },
        intuition: { type: "string", description: "The key insight or mental model for approaching it" },
        complexity: { type: "string", description: "Time and space complexity discussion, if applicable" },
        commonMistakes: {
          type: "array",
          items: { type: "string" },
          description: "Common mistakes or misconceptions related to this topic",
        },
      },
      required: ["explanation", "intuition", "complexity", "commonMistakes"],
    },
  },
};

export const generateExplanationFromAI = async (
  context: { source: "note" | "problem"; title: string; body: string }
): Promise<AiExplanationOutput> => {
  const systemPrompt =
    context.source === "note"
      ? "You are an expert technical interview coach. Explain the following note content clearly, " +
        "as if teaching someone preparing for interviews."
      : "You are an expert technical interview coach. You are given ONLY a problem's title, topic, " +
        "difficulty, and tags — NOT the full problem statement. Infer the most likely well-known problem " +
        "matching this title and explain it, but explicitly note in your explanation if the title is " +
        "ambiguous or unfamiliar rather than inventing specifics.";

  const completion = await llmClient.chat.completions.create({
    model: LLM_MODEL,
    temperature: 0.5,
    max_tokens: 1200,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: context.body },
    ],
    tools: [explainToolSchema],
    tool_choice: { type: "function", function: { name: "provide_explanation" } },
  });

  const toolCall = completion.choices[0]?.message?.tool_calls?.[0];

  if (!toolCall || toolCall.type !== "function") {
    throw new AppError("AI service did not return a structured response", 502);
  }

  let rawArgs: unknown;
  try {
    rawArgs = JSON.parse(toolCall.function.arguments);
  } catch {
    throw new AppError("AI service returned malformed JSON", 502);
  }

  const parseResult = aiExplanationOutputSchema.safeParse(rawArgs);
  if (!parseResult.success) {
    throw new AppError("AI service returned an invalid explanation structure", 502);
  }

  return parseResult.data;
};