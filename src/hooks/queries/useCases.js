import { useQuery } from "@tanstack/react-query";
import {
  getCases,
  getCaseById,
  getCaseHospitals,
  getBloodTypes,
} from "@/services/cases.service";

export const caseKeys = {
  all: ["cases"],
  list: (params) => ["cases", "list", params],
  detail: (id) => ["cases", "detail", id],
  hospitals: () => ["cases", "hospitals"],
  bloodTypes: () => ["cases", "blood-types"],
};

export const useGetCases = (apiParams = {}, locale = "en", options = {}) => {
  return useQuery({
    queryKey: caseKeys.list(apiParams),
    queryFn: () => getCases(apiParams, locale),
    ...options,
  });
};

export const useGetCaseById = (id, locale = "en") => {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => getCaseById(id, locale),
    enabled: !!id,
  });
};

export const useGetCaseHospitals = () => {
  return useQuery({
    queryKey: caseKeys.hospitals(),
    queryFn: getCaseHospitals,
  });
};

export const useGetBloodTypes = () => {
  return useQuery({
    queryKey: caseKeys.bloodTypes(),
    queryFn: getBloodTypes,
  });
};
