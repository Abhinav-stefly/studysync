import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
    testTimeout: 15000, // integration tests spinning up in-memory Mongo need more than the 5s default
  },
});