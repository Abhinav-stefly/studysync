import { axiosClient } from "./axiosClient";

export interface AiPlanTask {
  day: number;
  title: string;
  description: string;
}

export interface AiPlanPreview {
  title: string;
  tasks: AiPlanTask[];
}

export interface AiExplanation {
  explanation: string;
  intuition: string;
  complexity: string;
  commonMistakes: string[];
}

export const previewStudyPlan = async (goal: string, durationDays: number): Promise<AiPlanPreview> => {
  const { data } = await axiosClient.post("/ai/study-plan/preview", { goal, durationDays });
  return data.data;
};

export const explainResource = async (
  resourceType: "note" | "problem",
  resourceId: string
): Promise<AiExplanation> => {
  const { data } = await axiosClient.post("/ai/explain", { resourceType, resourceId });
  return data.data;
};