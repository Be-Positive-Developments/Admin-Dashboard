import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
} from "@/services/cases.service";

export const caseKeys = {
  all: ["cases"],
  list: (params) => ["cases", "list", params],
  detail: (id) => ["cases", "detail", id],
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useGetCases = (params = {}) => {
  return useQuery({
    queryKey: caseKeys.list(params),
    queryFn: () => getCases(params),
  });
};

export const useGetCaseById = (id) => {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => getCaseById(id),
    enabled: !!id,
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseKeys.all });
    },
  });
};

export const useUpdateCase = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateCase(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseKeys.all });
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(id) });
    },
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: caseKeys.all });
    },
  });
};
