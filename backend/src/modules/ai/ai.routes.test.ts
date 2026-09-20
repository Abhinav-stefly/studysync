import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import "dotenv/config";

// Mock Groq entirely — no real network calls, no cost, fully controllable output
vi.mock("../../config/llm.js", () => ({
  llmClient: { chat: { completions: { create: vi.fn() } } },
  LLM_MODEL: "test-model",
}));

// Mock Redis with a minimal in-memory stand-in — just enough for the
// rate limiter's incr/expire calls to work without a real Redis connection.
// This is a deliberate simplification: it doesn't emulate real TTL expiry,
// it just needs to not throw and to count correctly within one test file.
vi.mock("../../jobs/reportQueue.js", () => ({
  reportQueue: { add: vi.fn() },
}));
vi.mock("../../config/redis.js", () => {
  const store = new Map<string, number>();
  return {
    getRedisClient: () => ({
      incr: async (key: string) => {
        const next = (store.get(key) ?? 0) + 1;
        store.set(key, next);
        return next;
      },
      expire: async () => 1,
      get: async () => null,
      set: async () => "OK",
    }),
  };
});

import { llmClient } from "../../config/llm.js";
const mockCreate = llmClient.chat.completions.create as ReturnType<typeof vi.fn>;

const registerTestUser = async () => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    password: "password123",
  });
  // ASSUMPTION: matches { success, data: { accessToken, user } } envelope
  // used elsewhere in this project. Adjust this line if your real
  // auth.controller's register response shape differs.
  return res.body.data.accessToken as string;
};

describe("POST /api/ai/study-plan/preview", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("returns a validated plan when the LLM returns a well-formed tool call", async () => {
    const token = await registerTestUser();

    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          tool_calls: [{
            type: "function",
            function: {
              name: "create_study_plan",
              arguments: JSON.stringify({
                title: "Test Plan",
                tasks: [{ day: 1, title: "Task 1", description: "Do the thing" }],
              }),
            },
          }],
        },
      }],
    });

    const res = await request(app)
      .post("/api/ai/study-plan/preview")
      .set("Authorization", `Bearer ${token}`)
      .send({ goal: "Backend interview prep", durationDays: 5 });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Test Plan");
  });

  it("returns 502 when the LLM's plan exceeds the requested duration", async () => {
    const token = await registerTestUser();

    mockCreate.mockResolvedValueOnce({
      choices: [{
        message: {
          tool_calls: [{
            type: "function",
            function: {
              name: "create_study_plan",
              arguments: JSON.stringify({
                title: "Bad Plan",
                tasks: [{ day: 99, title: "Task 1", description: "Too late" }],
              }),
            },
          }],
        },
      }],
    });

    const res = await request(app)
      .post("/api/ai/study-plan/preview")
      .set("Authorization", `Bearer ${token}`)
      .send({ goal: "Backend interview prep", durationDays: 5 });

    expect(res.status).toBe(502);
  });

  it("rejects without a token", async () => {
    const res = await request(app)
      .post("/api/ai/study-plan/preview")
      .send({ goal: "Backend interview prep", durationDays: 5 });

    expect(res.status).toBe(401);
  });

  it("rejects durationDays over 90 before ever calling the LLM", async () => {
    const token = await registerTestUser();

    const res = await request(app)
      .post("/api/ai/study-plan/preview")
      .set("Authorization", `Bearer ${token}`)
      .send({ goal: "Backend interview prep", durationDays: 500 });

    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled(); // proves Zod caught it, not the LLM
  });
});