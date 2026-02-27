import axiosInstance from '@/lib/axiosInstance';

/**
 * Auth service — handles login and logout API calls.
 *
 * login:  POSTs credentials, receives a JWT token, and stores it in
 *         localStorage so the request interceptor picks it up automatically
 *         on subsequent requests.
 * logout: Removes the token from localStorage (server-side invalidation
 *         can be added here if the backend supports it).
 */

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = async (credentials) => {
  const { data } = await axiosInstance.post('/auth/login', credentials);

  if (data?.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};

/**
 * @returns {void}
 */
export const logout = () => {
  localStorage.removeItem('token');
};
