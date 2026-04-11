import axiosInstance from "@/lib/axiosInstance";
import {
  storeTokens,
  clearTokens,
  getRefreshToken,
  broadcastLogout,
} from "@/lib/sessionManager";

// Backend may wrap payloads as: { statusCode, message, traceId, value }.
// Return `value` when present so callers can use one consistent shape.
const unwrapApiEnvelope = (data) => data?.value ?? data;

/**
 * Auth service — maps to /api/Auth endpoints.
 *
 * Response shape from the backend (LoginResult):
 * {
 *   success: boolean,
 *   message: string,
 *   errorCode: string | null,
 *   auth: { token, refreshtoken, tokenexpiry } | null,
 *   verification: { requiresOtpVerification, emailConfirmed, email? } | null,
 *   user: { id, userName, email, userType, roles } | null,
 * }
 */

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * POST /api/Auth/Adminlogin
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<LoginResult>}
 *
 * On 200 → tokens are stored automatically.
 * On 202 → returns verification details (OTP required).
 * On 401 → invalid credentials (axios throws, caller catches).
 * On 403 → account locked.
 */
export const login = async (credentials) => {
  const { data } = await axiosInstance.post("/Auth/Adminlogin", credentials);

  // Don't store tokens here — the login page will store them
  // only after OTP verification succeeds.

  return unwrapApiEnvelope(data);
};

// ─── OTP Verification (Login 2FA) ───────────────────────────────────────────

/**
 * POST /api/Auth/login/verify
 * @param {{ email: string, otp: string }} payload
 * @returns {Promise<LoginResult>}
 */
export const verifyLoginOtp = async (payload) => {
  const { data } = await axiosInstance.post("/Auth/login/verify", payload);

  // Tokens are stored by the caller (Login.jsx) via sessionManager.storeTokens
  // so the remember-me flag is respected.

  return unwrapApiEnvelope(data);
};

/**
 * POST /api/Auth/login/resend-otp?email=...
 * @param {string} email
 * @returns {Promise<ResendOtpResult>}
 */
export const resendLoginOtp = async (email) => {
  const { data } = await axiosInstance.post(
    `/Auth/login/resend-otp?email=${encodeURIComponent(email)}`,
  );
  return unwrapApiEnvelope(data);
};

// ─── Forgot Password ────────────────────────────────────────────────────────

/**
 * POST /api/Auth/password/forgot?email=...
 * Sends a 6-digit OTP to the user's email.
 * @param {string} email
 * @returns {Promise<ForgotPasswordResult>}
 */
export const forgotPassword = async (email) => {
  const { data } = await axiosInstance.post(
    `/Auth/password/forgot?email=${encodeURIComponent(email)}`,
  );
  return unwrapApiEnvelope(data);
};

/**
 * POST /api/Auth/password/verifyotp
 * Verifies the OTP and returns a short-lived reset token.
 * @param {{ email: string, otp: string }} payload
 * @returns {Promise<VerifyResetOtpResult>}
 */
export const verifyPasswordOtp = async (payload) => {
  const { data } = await axiosInstance.post(
    "/Auth/password/verifyotp",
    payload,
  );
  return unwrapApiEnvelope(data);
};

/**
 * POST /api/Auth/password/reset
 * Final step — resets the password using the reset token.
 * @param {{ email: string, token: string, newPassword: string }} payload
 * @returns {Promise<ResetPasswordResult>}
 */
export const resetPassword = async (payload) => {
  const { data } = await axiosInstance.post("/Auth/password/reset", payload);
  return unwrapApiEnvelope(data);
};

/**
 * POST /api/Auth/password/resend-otp?email=...
 * @param {string} email
 * @returns {Promise<ResendOtpResult>}
 */
export const resendPasswordOtp = async (email) => {
  const { data } = await axiosInstance.post(
    `/Auth/password/resend-otp?email=${encodeURIComponent(email)}`,
  );
  return unwrapApiEnvelope(data);
};

// ─── Logout ──────────────────────────────────────────────────────────────────

/**
 * POST /api/Auth/logout  (requires Bearer token)
 * Revokes all refresh tokens server-side, then clears local storage.
 */
export const logout = async () => {
  try {
    await axiosInstance.post("/Auth/logout");
  } finally {
    clearTokens();
    broadcastLogout();
  }
};

// ─── Token Refresh ───────────────────────────────────────────────────────────

/**
 * POST /api/Auth/token/refresh
 * @returns {Promise<RefreshTokenResult>}
 */
export const refreshToken = async () => {
  const currentRefreshToken = getRefreshToken();

  const { data } = await axiosInstance.post("/Auth/token/refresh", {
    refreshtoken: currentRefreshToken,
  });

  const payload = unwrapApiEnvelope(data);

  if (payload?.auth) {
    storeTokens(payload.auth);
  }

  return payload;
};

// ─── Current User ────────────────────────────────────────────────────────────

/**
 * GET /api/Auth/me
 * @returns {Promise<object>}
 */
export const getCurrentUser = async () => {
  const { data } = await axiosInstance.get("/Auth/me");
  return unwrapApiEnvelope(data);
};
