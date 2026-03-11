import axios from "axios";
import { getToken, clearTokens } from "@/lib/sessionManager";

/**
 * A pre-configured Axios instance shared across the entire app.
 *
 * - baseURL is pulled from the Vite env variable VITE_BASE_URL.
 * - Request interceptor: reads the JWT via sessionManager and attaches it
 *   as an Authorization Bearer header on every outgoing request.
 * - Response interceptor: if the server returns 401 Unauthorized (expired /
 *   missing token), the user's token is cleared and they are redirected to
 *   the login page automatically.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  // Pass successful responses straight through.
  (response) => response,

  // On error, check for 401 and redirect to /login.
  // EXCEPT for auth endpoints (login, verify, etc.) — those should
  // surface the error to the UI so the user sees "Invalid credentials".
  (error) => {
    const isAuthRequest = error.config?.url?.toLowerCase().includes("/auth/");

    if (error.response?.status === 401 && !isAuthRequest) {
      clearTokens();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
