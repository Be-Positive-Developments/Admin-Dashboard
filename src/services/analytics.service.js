import axiosInstance from "@/lib/axiosInstance";

/**
 * Analytics service — fetches dashboard statistics and chart data.
 */

/**
 * Fetch aggregated dashboard overview stats (totals, growth rates, etc.).
 * @returns {Promise<object>}
 */
export const getAnalytics = async () => {
  const { data } = await axiosInstance.get("/analytics");
  return data;
};

/**
 * Fetch analytics filtered by a date range.
 * @param {{ startDate: string, endDate: string }} params  ISO date strings
 * @returns {Promise<object>}
 */
export const getAnalyticsByRange = async (params) => {
  const { data } = await axiosInstance.get("/analytics/range", { params });
  return data;
};
