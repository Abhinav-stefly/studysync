import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProblems, updateProblemStatus, deleteProblem, type ProblemFilters, type Problem } from "../../api/problems.api";

export const useProblems = (filters: ProblemFilters) => {
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: () => fetchProblems(filters),
  });
};

export const useUpdateProblemStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Problem["status"] }) =>
      updateProblemStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
};

export const useDeleteProblem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProblem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problems"] });
    },
  });
};