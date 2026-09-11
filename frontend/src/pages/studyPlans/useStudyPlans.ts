import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStudyPlans, createStudyPlan, deleteStudyPlan, updateTaskStatus } from "../../api/studyPlans.api";

export const useStudyPlans = () => {
  return useQuery({
    queryKey: ["studyPlans"],
    queryFn: fetchStudyPlans,
  });
};

export const useCreateStudyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStudyPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studyPlans"] }),
  });
};

export const useDeleteStudyPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteStudyPlan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studyPlans"] }),
  });
};

export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, taskId, completed }: { planId: string; taskId: string; completed: boolean }) =>
      updateTaskStatus(planId, taskId, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studyPlans"] }),
  });
};