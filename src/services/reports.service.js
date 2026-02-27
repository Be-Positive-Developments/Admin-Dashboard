import axiosInstance from '@/lib/axiosInstance';

/**
 * Reports service — operations for the /reports resource.
 */

/**
 * @param {{ page?: number, limit?: number, type?: string }} params
 * @returns {Promise<{ data: object[], total: number }>}
 */
export const getReports = async (params = {}) => {
  const { data } = await axiosInstance.get('/reports', { params });
  return data;
};

/**
 * @param {string | number} id
 * @returns {Promise<object>}
 */
export const getReportById = async (id) => {
  const { data } = await axiosInstance.get(`/reports/${id}`);
  return data;
};

/**
 * Trigger a report export (e.g. PDF / CSV).
 * @param {{ type: string, filters?: object }} payload
 * @returns {Promise<{ downloadUrl: string }>}
 */
export const exportReport = async (payload) => {
  const { data } = await axiosInstance.post('/reports/export', payload);
  return data;
};
