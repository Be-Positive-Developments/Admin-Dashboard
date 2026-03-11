import { useQuery } from "@tanstack/react-query";
import {
  getAnalytics,
  getAnalyticsByRange,
} from "@/services/analytics.service";

export const analyticsKeys = {
  all: ["analytics"],
  overview: () => ["analytics", "overview"],
  range: (params) => ["analytics", "range", params],
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch the main dashboard overview analytics.
 */
export const useGetAnalytics = () => {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: getAnalytics,
  });
};

/**
 * Fetch analytics for a specific date range.
 * @param {{ startDate: string, endDate: string }} params
 */
export const useGetAnalyticsByRange = (params) => {
  return useQuery({
    queryKey: analyticsKeys.range(params),
    queryFn: () => getAnalyticsByRange(params),
    // Only run when both dates are provided.
    enabled: !!(params?.startDate && params?.endDate),
  });
};
