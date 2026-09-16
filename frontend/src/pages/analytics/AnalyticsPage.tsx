import { useMemo } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useDashboardStats } from "./useAnalytics";
import type { DifficultyStat } from "../../api/analytics.api";

const DIFFICULTY_ORDER: DifficultyStat["difficulty"][] = ["easy", "medium", "hard"];
const DIFFICULTY_COLORS: Record<DifficultyStat["difficulty"], string> = {
  easy: "#2f6f5e",   // signal
  medium: "#c9a13f", // a muted gold, sits between signal and rust — not in the core 4-color palette,
                      // used ONLY here for a 3-way chart where 3 distinct hues are functionally necessary
  hard: "#b4532a",   // rust
};

export const AnalyticsPage = () => {
  const { data, isLoading, error } = useDashboardStats();

  // Fix Mongo's unordered $group output into a stable, always-present
  // easy/medium/hard order — even if a difficulty has zero solved problems,
  // it should still show as a zero-height bar, not silently disappear.
  const orderedDifficulty = useMemo(() => {
    if (!data) return [];
    return DIFFICULTY_ORDER.map((difficulty) => {
      const found = data.difficultyBreakdown.find((d) => d.difficulty === difficulty);
      return { difficulty, count: found?.count ?? 0 };
    });
  }, [data]);

  // Reverse newest-first API order into chronological left-to-right for the trend line
  const chronologicalTrend = useMemo(() => {
    if (!data) return [];
    return [...data.weeklyTrend].reverse().map((report) => ({
      ...report,
      weekLabel: new Date(report.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    }));
  }, [data]);

  if (isLoading) return <p className="font-sans text-sm text-ink/50">Loading analytics…</p>;
  if (error) return <p className="font-sans text-sm text-rust">Couldn't load analytics.</p>;
  if (!data) return null;

  return (
    <div>
      <h1 className="mb-6 border-b border-ink/10 pb-4 font-display text-2xl text-ink">Analytics</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1: Overall completion */}
        <div className="border border-ink/10 bg-white p-5">
          <h2 className="mb-4 font-sans text-sm font-medium text-ink/70">Overall progress</h2>
          <p className="font-display text-4xl text-signal">{data.overall.completionRate}%</p>
          <p className="mt-1 font-sans text-sm text-ink/50">
            {data.overall.solved} of {data.overall.total} problems solved
          </p>
          <div className="mt-4 h-1.5 w-full bg-ink/10">
            <div className="h-full bg-signal" style={{ width: `${data.overall.completionRate}%` }} />
          </div>
        </div>

        {/* Card 2: Difficulty breakdown */}
        <div className="border border-ink/10 bg-white p-5">
          <h2 className="mb-4 font-sans text-sm font-medium text-ink/70">Solved by difficulty</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={orderedDifficulty}
                dataKey="count"
                nameKey="difficulty"
                innerRadius={45}
                outerRadius={70}
              >
                {orderedDifficulty.map((entry) => (
                  <Cell key={entry.difficulty} fill={DIFFICULTY_COLORS[entry.difficulty]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4 font-sans text-xs text-ink/60">
            {orderedDifficulty.map((d) => (
              <span key={d.difficulty} className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: DIFFICULTY_COLORS[d.difficulty] }}
                />
                {d.difficulty} ({d.count})
              </span>
            ))}
          </div>
        </div>

        {/* Card 3: Top topics */}
        <div className="border border-ink/10 bg-white p-5">
          <h2 className="mb-4 font-sans text-sm font-medium text-ink/70">Top topics</h2>
          {data.topicBreakdown.length === 0 ? (
            <p className="font-sans text-sm text-ink/40">No solved problems yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topicBreakdown} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="topic" width={100} tick={{ fontSize: 12, fill: "#1B2430" }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2f6f5e" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Card 4: 8-week trend */}
        <div className="border border-ink/10 bg-white p-5">
          <h2 className="mb-4 font-sans text-sm font-medium text-ink/70">8-week trend</h2>
          {chronologicalTrend.length === 0 ? (
            <p className="font-sans text-sm text-ink/40">
              No weekly reports yet — these generate automatically each Sunday.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chronologicalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1B243015" />
                <XAxis dataKey="weekLabel" tick={{ fontSize: 12, fill: "#1B2430" }} />
                <YAxis tick={{ fontSize: 12, fill: "#1B2430" }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="problemsSolved" stroke="#2f6f5e" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};