import { Problem } from "../problems/problem.model.js";
import { ProgressReport } from "./progressReport.model.js";
import mongoose from "mongoose"
export const getDashboardStats = async (userId: string) => {
  const [difficultyBreakdown, topicBreakdown, overallStats, recentReports] = await Promise.all([
    Problem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "solved" } },
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $project: { _id: 0, difficulty: "$_id", count: 1 } },
    ]),

    Problem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: "solved" } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, topic: "$_id", count: 1 } },
    ]),

    Problem.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          solved: { $sum: { $cond: [{ $eq: ["$status", "solved"] }, 1, 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          solved: 1,
          completionRate: {
            $cond: [
              { $eq: ["$total", 0] },
              0,
              { $round: [{ $multiply: [{ $divide: ["$solved", "$total"] }, 100] }, 0] },
            ],
          },
        },
      },
    ]),

    ProgressReport.find({ userId }).sort("-weekStart").limit(8),
  ]);

  return {
    difficultyBreakdown,
    topicBreakdown,
    overall: overallStats[0] || { total: 0, solved: 0, completionRate: 0 },
    weeklyTrend: recentReports,
  };
};
const getWeekBoundaries = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  return { weekStart, weekEnd };
};

export const generateWeeklyReport = async (userId: string) => {
  const { weekStart, weekEnd } = getWeekBoundaries();

  const problemsSolved = await Problem.countDocuments({
    userId,
    status: "solved",
    updatedAt: { $gte: weekStart, $lt: weekEnd },
  });

  const totalProblems = await Problem.countDocuments({ userId });
  const solvedProblems = await Problem.countDocuments({ userId, status: "solved" });
  const completionRate = totalProblems === 0 ? 0 : Math.round((solvedProblems / totalProblems) * 100);

  // Study hours would come from a StudySession model in a fuller implementation —
  // kept simple here since the spec doesn't require deep session tracking.
  const studyHours = 0;

  // Upsert: idempotent by design. Re-running this for the same user+week
  // updates the same document instead of creating a duplicate.
  const report = await ProgressReport.findOneAndUpdate(
    { userId, weekStart },
    {
      $set: {
        weekEnd,
        problemsSolved,
        studyHours,
        completionRate,
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true }
  );

  return report;
};