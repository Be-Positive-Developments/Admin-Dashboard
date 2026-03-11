import axiosInstance from "@/lib/axiosInstance";

/**
 * Cases service — CRUD operations for the /cases resource.
 */

/**
 * @param {{ page?: number, limit?: number, status?: string }} params
 * @returns {Promise<{ data: object[], total: number }>}
 */
export const getCases = async (params = {}) => {
  const { data } = await axiosInstance.get("/cases", { params });
  return data;
};

/**
 * @param {string | number} id
 * @returns {Promise<object>}
 */
export const getCaseById = async (id) => {
  const { data } = await axiosInstance.get(`/cases/${id}`);
  return data;
};

/**
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const createCase = async (payload) => {
  const { data } = await axiosInstance.post("/cases", payload);
  return data;
};

/**
 * @param {string | number} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const updateCase = async (id, payload) => {
  const { data } = await axiosInstance.put(`/cases/${id}`, payload);
  return data;
};

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
export const deleteCase = async (id) => {
  const { data } = await axiosInstance.delete(`/cases/${id}`);
  return data;
};
