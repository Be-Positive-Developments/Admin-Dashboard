import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsSummary,
  getDonationsTrend,
  getHospitalsByGovernorate,
  getBloodTypeDemand,
} from "@/services/analytics.service";

export const analyticsKeys = {
  all: ["analytics"],
  summary: () => ["analytics", "summary"],
  donationsTrend: () => ["analytics", "donations-trend"],
  hospitalsByGovernorate: () => ["analytics", "hospitals-by-governorate"],
  bloodTypeDemand: () => ["analytics", "blood-type-demand"],
};

export const useGetAnalyticsSummary = () => {
  return useQuery({
    queryKey: analyticsKeys.summary(),
    queryFn: getAnalyticsSummary,
  });
};

export const useGetDonationsTrend = () => {
  return useQuery({
    queryKey: analyticsKeys.donationsTrend(),
    queryFn: getDonationsTrend,
  });
};

export const useGetHospitalsByGovernorate = () => {
  return useQuery({
    queryKey: analyticsKeys.hospitalsByGovernorate(),
    queryFn: getHospitalsByGovernorate,
  });
};

export const useGetBloodTypeDemand = () => {
  return useQuery({
    queryKey: analyticsKeys.bloodTypeDemand(),
    queryFn: getBloodTypeDemand,
  });
};

/** @deprecated Use useGetAnalyticsSummary */
export const useGetAnalytics = useGetAnalyticsSummary;

/** @deprecated Not supported by admin API */
export const useGetAnalyticsByRange = () => {
  return useGetAnalyticsSummary();
};
