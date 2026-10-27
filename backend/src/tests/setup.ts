import "dotenv/config";
import { beforeAll, afterAll, afterEach, vi } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

process.env.LOG_LEVEL = "silent";

vi.mock("../config/llm.js", () => ({
  llmClient: { chat: { completions: { create: vi.fn() } } },
  LLM_MODEL: "test-model",
}));

vi.mock("../config/redis.js", () => {
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

vi.mock("../jobs/reportQueue.js", () => ({
  reportQueue: { add: vi.fn(), upsertJobScheduler: vi.fn(), addBulk: vi.fn() },
}));

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  // Fresh, empty collections for every test, so tests can't affect each other
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});