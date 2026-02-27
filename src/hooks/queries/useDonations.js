import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDonations,
  getDonationById,
  createDonation,
  updateDonation,
  deleteDonation,
} from '@/services/donations.service';

export const donationKeys = {
  all: ['donations'],
  list: (params) => ['donations', 'list', params],
  detail: (id) => ['donations', 'detail', id],
};

// ─── Queries ─────────────────────────────────────────────────────────────────

export const useGetDonations = (params = {}) => {
  return useQuery({
    queryKey: donationKeys.list(params),
    queryFn: () => getDonations(params),
  });
};

export const useGetDonationById = (id) => {
  return useQuery({
    queryKey: donationKeys.detail(id),
    queryFn: () => getDonationById(id),
    enabled: !!id,
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.all });
    },
  });
};

export const useUpdateDonation = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateDonation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.all });
      queryClient.invalidateQueries({ queryKey: donationKeys.detail(id) });
    },
  });
};

export const useDeleteDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donationKeys.all });
    },
  });
};
