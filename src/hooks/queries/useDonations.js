import { useQuery } from "@tanstack/react-query";
import {
  getDonors,
  getDonorById,
  getDonorStats,
} from "@/services/donations.service";

export const donationKeys = {
  all: ["donors"],
  list: (params) => ["donors", "list", params],
  detail: (id) => ["donors", "detail", id],
  stats: () => ["donors", "stats"],
};

export const useGetDonors = (params = {}, locale = "en") => {
  return useQuery({
    queryKey: donationKeys.list(params),
    queryFn: () => getDonors(params, locale),
  });
};

export const useGetDonorById = (id, locale = "en") => {
  return useQuery({
    queryKey: donationKeys.detail(id),
    queryFn: () => getDonorById(id, locale),
    enabled: !!id,
  });
};

export const useGetDonorStats = () => {
  return useQuery({
    queryKey: donationKeys.stats(),
    queryFn: getDonorStats,
  });
};

/** @deprecated Use useGetDonors */
export const useGetDonations = useGetDonors;

/** @deprecated Use useGetDonorById */
export const useGetDonationById = useGetDonorById;
