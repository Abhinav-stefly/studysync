import { axiosClient } from "./axiosClient";

export interface Problem {
  _id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  tags: string[];
  status: "not-started" | "in-progress" | "solved";
  link?: string;
}

export interface ProblemFilters {
  page?: number;
  limit?: number;
  difficulty?: "easy" | "medium" | "hard";
  topic?: string;
  status?: "not-started" | "in-progress" | "solved";
  search?: string;
  sort?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProblemsResponse {
  problems: Problem[];
  pagination: Pagination;
}

export const fetchProblems = async (filters: ProblemFilters): Promise<ProblemsResponse> => {
  const { data } = await axiosClient.get("/problems", { params: filters });
  // Matches res.json({ success: true, ...result }) where result = { problems, pagination }
  const { success, ...result } = data;
  return result as ProblemsResponse;
};

export const updateProblemStatus = async (id: string, status: Problem["status"]): Promise<Problem> => {
  const { data } = await axiosClient.patch(`/problems/${id}`, { status });
  return data.data;
};

export const createProblem = async (input: {
  title: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  tags?: string[];
  link?: string;
}): Promise<Problem> => {
  const { data } = await axiosClient.post("/problems", input);
  return data.data;
};

export const deleteProblem = async (id: string): Promise<void> => {
  await axiosClient.delete(`/problems/${id}`);
};