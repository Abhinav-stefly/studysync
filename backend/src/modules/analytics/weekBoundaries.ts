export type ReportPeriod = "current" | "previous";

// Weeks run Sunday 00:00 UTC to the next Sunday 00:00 UTC. Using UTC methods
// makes the result identical on every machine, regardless of its timezone.
export const getWeekBoundaries = (period: ReportPeriod = "current", now: Date = new Date()) => {
  const weekStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay())
  );
  if (period === "previous") {
    weekStart.setUTCDate(weekStart.getUTCDate() - 7);
  }

  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  return { weekStart, weekEnd };
};