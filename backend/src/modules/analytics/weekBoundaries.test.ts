import { describe, it, expect } from "vitest";
import { getWeekBoundaries } from "./weekBoundaries.js";

const iso = (d: Date) => d.toISOString();

describe("getWeekBoundaries", () => {
  it("returns the Sunday-to-Sunday week containing a midweek date", () => {
    const { weekStart, weekEnd } = getWeekBoundaries("current", new Date("2026-10-21T15:30:00Z"));
    expect(iso(weekStart)).toBe("2026-10-18T00:00:00.000Z");
    expect(iso(weekEnd)).toBe("2026-10-25T00:00:00.000Z");
  });

  it("at the exact Sunday-midnight scheduled run, 'previous' is the week that just ended", () => {
    const { weekStart, weekEnd } = getWeekBoundaries("previous", new Date("2026-10-25T00:00:00.500Z"));
    expect(iso(weekStart)).toBe("2026-10-18T00:00:00.000Z");
    expect(iso(weekEnd)).toBe("2026-10-25T00:00:00.000Z");
  });

  it("gives the same answer when the scheduled job runs late", () => {
    // e.g. the server was asleep and the worker caught up on Monday evening
    const { weekStart } = getWeekBoundaries("previous", new Date("2026-10-26T18:00:00Z"));
    expect(iso(weekStart)).toBe("2026-10-18T00:00:00.000Z");
  });

  it("handles a week that crosses a month boundary", () => {
    const { weekStart, weekEnd } = getWeekBoundaries("current", new Date("2026-11-02T10:00:00Z"));
    expect(iso(weekStart)).toBe("2026-11-01T00:00:00.000Z");
    expect(iso(weekEnd)).toBe("2026-11-08T00:00:00.000Z");
  });
});