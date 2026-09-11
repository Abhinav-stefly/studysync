import { axiosClient } from "./axiosClient";

export interface Task {
  _id: string;
  name: string;
  completed: boolean;
  deadline?: string;
}

export interface StudyPlan {
  _id: string;
  title: string;
  tasks: Task[];
  progress: number;
  completedCount: number;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
}

export const fetchStudyPlans = async (): Promise<StudyPlan[]> => {
  const { data } = await axiosClient.get("/study-plans"); // adjust path if your mount differs, e.g. /studyPlans
  return data.data;
};

export const createStudyPlan = async (input: {
  title: string;
  tasks: { name: string; deadline?: string }[];
}): Promise<StudyPlan> => {
  const { data } = await axiosClient.post("/study-plans", input);
  return data.data;
};

export const deleteStudyPlan = async (id: string): Promise<void> => {
  await axiosClient.delete(`/study-plans/${id}`);
};

export const updateTaskStatus = async (
  planId: string,
  taskId: string,
  completed: boolean
): Promise<StudyPlan> => {
  const { data } = await axiosClient.patch(`/study-plans/${planId}/tasks/${taskId}`, { completed });
  return data.data;
};