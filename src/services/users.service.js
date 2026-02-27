import axiosInstance from '@/lib/axiosInstance';

/**
 * Users service — CRUD operations for the /users resource.
 *
 * All functions return the `data` payload from the response directly
 * so consuming hooks never need to unwrap the axios response object.
 */

/**
 * Fetch a paginated list of users.
 * @param {{ page?: number, limit?: number, search?: string }} params
 * @returns {Promise<{ data: object[], total: number, page: number }>}
 */
export const getUsers = async (params = {}) => {
  const { data } = await axiosInstance.get('/users', { params });
  return data;
};

/**
 * Fetch a single user by ID.
 * @param {string | number} id
 * @returns {Promise<object>}
 */
export const getUserById = async (id) => {
  const { data } = await axiosInstance.get(`/users/${id}`);
  return data;
};

/**
 * Create a new user.
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const createUser = async (payload) => {
  const { data } = await axiosInstance.post('/users', payload);
  return data;
};

/**
 * Update an existing user.
 * @param {string | number} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const updateUser = async (id, payload) => {
  const { data } = await axiosInstance.put(`/users/${id}`, payload);
  return data;
};

/**
 * Delete a user.
 * @param {string | number} id
 * @returns {Promise<void>}
 */
export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`/users/${id}`);
  return data;
};
