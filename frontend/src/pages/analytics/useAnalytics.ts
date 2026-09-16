import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats } from "../../api/analytics.api";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: fetchDashboardStats,
  });
};