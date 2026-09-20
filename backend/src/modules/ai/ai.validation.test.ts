import { describe, it, expect } from "vitest";
import {
  generateStudyPlanSchema,
  aiPlanOutputSchema,
  validatePlanWithinDuration,
} from "./ai.validation.js";

describe("generateStudyPlanSchema", () => {
  it("accepts a valid request", () => {
    const result = generateStudyPlanSchema.safeParse({ goal: "SDE interview prep", durationDays: 30 });
    expect(result.success).toBe(true);
  });

  it("rejects durationDays over 90", () => {
    const result = generateStudyPlanSchema.safeParse({ goal: "SDE interview prep", durationDays: 500 });
    expect(result.success).toBe(false);
  });

  it("rejects a goal shorter than 5 characters", () => {
    const result = generateStudyPlanSchema.safeParse({ goal: "hi", durationDays: 7 });
    expect(result.success).toBe(false);
  });

  it("coerces a string durationDays into a number", () => {
    // Real-world case: query params / form data arrive as strings.
    const result = generateStudyPlanSchema.safeParse({ goal: "SDE interview prep", durationDays: "14" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.durationDays).toBe(14);
    }
  });
});

describe("validatePlanWithinDuration", () => {
  it("does not throw when all tasks are within range", () => {
    const plan = {
      title: "Test Plan",
      tasks: [{ day: 1, title: "a", description: "b" }, { day: 5, title: "c", description: "d" }],
    };
    expect(() => validatePlanWithinDuration(plan, 7)).not.toThrow();
  });

  it("throws when a task exceeds the requested duration", () => {
    const plan = {
      title: "Test Plan",
      tasks: [{ day: 1, title: "a", description: "b" }, { day: 45, title: "c", description: "d" }],
    };
    expect(() => validatePlanWithinDuration(plan, 30)).toThrow(/exceeding requested duration/);
  });
});