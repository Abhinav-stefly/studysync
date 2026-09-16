import { useMutation, useQueryClient } from "@tanstack/react-query";
import { previewStudyPlan, explainResource } from "../../api/ai.api";
import { createStudyPlan } from "../../api/studyPlans.api";

export const usePreviewStudyPlan = () => {
  return useMutation({
    mutationFn: ({ goal, durationDays }: { goal: string; durationDays: number }) =>
      previewStudyPlan(goal, durationDays),
  });
};

export const useAcceptGeneratedPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plan: { title: string; tasks: { name: string }[] }) => createStudyPlan(plan),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studyPlans"] }),
  });
};

export const useExplainResource = () => {
  return useMutation({
    mutationFn: ({ resourceType, resourceId }: { resourceType: "note" | "problem"; resourceId: string }) =>
      explainResource(resourceType, resourceId),
  });
};