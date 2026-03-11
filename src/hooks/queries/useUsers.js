import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "@/services/users.service";

/**
 * Query keys are centralised here so they can be reused for
 * cache invalidation without magic strings scattered around the app.
 */
export const userKeys = {
  all: ["users"],
  list: (params) => ["users", "list", params],
  detail: (id) => ["users", "detail", id],
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated / filtered list of users.
 * @param {{ page?: number, limit?: number, search?: string }} params
 */
export const useGetUsers = (params = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
};

/**
 * Fetch a single user by ID.
 * @param {string | number} id
 */
export const useGetUserById = (id) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    // Only run the query when an id is actually provided.
    enabled: !!id,
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Create a new user. Automatically invalidates the users list cache
 * so the UI reflects the new entry without a manual refresh.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};

/**
 * Update a user. Invalidates both the list and the specific user detail.
 * @example
 * const { mutate } = useUpdateUser(id);
 * mutate(payload);
 */
export const useUpdateUser = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => updateUser(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
    },
  });
};

/**
 * Delete a user. Invalidates the users list cache after deletion.
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
};
