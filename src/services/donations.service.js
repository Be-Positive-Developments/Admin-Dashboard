import axiosInstance from "@/lib/axiosInstance";

/**
 * Donations service — CRUD operations for the /donations resource.
 */

/**
 * @param {{ page?: number, limit?: number, status?: string }} params
 * @returns {Promise<{ data: object[], total: number }>}
 */
export const getDonations = async (params = {}) => {
  const { data } = await axiosInstance.get("/donations", { params });
  return data;
};

/**
 * @param {string | number} id
 * @returns {Promise<object>}
 */
export const getDonationById = async (id) => {
  const { data } = await axiosInstance.get(`/donations/${id}`);
  return data;
};

/**
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const createDonation = async (payload) => {
  const { data } = await axiosInstance.post("/donations", payload);
  return data;
};

/**
 * @param {string | number} id
 * @param {object} payload
 * @returns {Promise<object>}
 */
export const updateDonation = async (id, payload) => {
  const { data } = await axiosInstance.put(`/donations/${id}`, payload);
  return data;
};

/**
 * @param {string | number} id
 * @returns {Promise<void>}
 */
export const deleteDonation = async (id) => {
  const { data } = await axiosInstance.delete(`/donations/${id}`);
  return data;
};
