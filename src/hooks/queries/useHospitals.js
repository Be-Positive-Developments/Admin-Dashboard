import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getHospitals,
  getHospitalById,
  getHospitalStats,
  activateHospital,
  rejectHospital,
} from "@/services/hospitals.service";

export const hospitalKeys = {
  all: ["hospitals"],
  list: (params) => ["hospitals", "list", params],
  detail: (id) => ["hospitals", "detail", id],
  stats: () => ["hospitals", "stats"],
};

/**
 * Fetch a paginated / filtered list of hospitals.
 * @param {{ status?: string, page?: number, limit?: number, pageSize?: number }} params
 */
export const useGetHospitals = (params = {}) => {
  return useQuery({
    queryKey: hospitalKeys.list(params),
    queryFn: () => getHospitals(params),
  });
};

/**
 * Fetch hospital statistics.
 */
export const useGetHospitalStats = () => {
  return useQuery({
    queryKey: hospitalKeys.stats(),
    queryFn: getHospitalStats,
  });
};

/**
 * Fetch a single hospital by ID.
 * @param {string | number | null | undefined} id
 */
export const useGetHospitalById = (id) => {
  return useQuery({
    queryKey: hospitalKeys.detail(id),
    queryFn: () => getHospitalById(id),
    enabled: !!id,
  });
};

/**
 * Approve a hospital join request.
 */
export const useActivateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.all });
    },
  });
};

/**
 * Reject a hospital join request.
 */
export const useRejectHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectHospital,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.all });
    },
  });
};
