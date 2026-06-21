import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRecentRegistrations,
  getActivityChart,
} from "@/services/dashboard.service";

export const dashboardKeys = {
  all: ["dashboard"],
  stats: () => ["dashboard", "stats"],
  recentRegistrations: (params) => [
    "dashboard",
    "recent-registrations",
    params,
  ],
  activityChart: () => ["dashboard", "activity-chart"],
};

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
  });
};

export const useGetRecentRegistrations = (
  params = { limit: 5 },
  locale = "en",
) => {
  return useQuery({
    queryKey: dashboardKeys.recentRegistrations(params),
    queryFn: () => getRecentRegistrations(params, locale),
  });
};

export const useGetActivityChart = () => {
  return useQuery({
    queryKey: dashboardKeys.activityChart(),
    queryFn: getActivityChart,
  });
};
