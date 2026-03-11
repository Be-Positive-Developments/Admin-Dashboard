import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getReports,
  getReportById,
  exportReport,
} from "@/services/reports.service";

export const reportKeys = {
  all: ["reports"],
  list: (params) => ["reports", "list", params],
  detail: (id) => ["reports", "detail", id],
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useGetReports = (params = {}) => {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => getReports(params),
  });
};

export const useGetReportById = (id) => {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => getReportById(id),
    enabled: !!id,
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Trigger a report export (PDF / CSV).
 * The mutation result contains a downloadUrl the UI can use.
 */
export const useExportReport = () => {
  return useMutation({
    mutationFn: exportReport,
  });
};
