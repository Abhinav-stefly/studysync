import { axiosClient } from "./axiosClient";

export interface DifficultyStat {
  difficulty: "easy" | "medium" | "hard";
  count: number;
}

export interface TopicStat {
  topic: string;
  count: number;
}

export interface OverallStats {
  total: number;
  solved: number;
  completionRate: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  problemsSolved: number;
  studyHours: number;
  completionRate: number;
}

export interface DashboardStats {
  difficultyBreakdown: DifficultyStat[];
  topicBreakdown: TopicStat[];
  overall: OverallStats;
  weeklyTrend: WeeklyReport[];
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await axiosClient.get("/analytics/dashboard");
  return data.data;
};