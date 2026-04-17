/**
 * Maps backend errorCode values to i18n translation keys.
 *
 * The backend always returns English messages regardless of the user's
 * language. Instead of displaying those raw messages, we look up the
 * errorCode and return the corresponding i18n key so it can be
 * translated at render time — this way switching languages instantly
 * re-translates the visible error without a new API request.
 *
 * Usage:
 *   import { getApiError } from '@/lib/apiErrors';
 *   const key = getApiError(err, 'invalid_email_or_password');
 *   // in JSX: {t(errorKey)}
 *
 * @param {import('axios').AxiosError} error — The Axios error from the catch/onError.
 * @param {string} [fallbackKey]             — Optional i18n key used when no errorCode is matched.
 * @returns {string} An i18n translation key (NOT the translated text).
 */

// Map of backend errorCode → i18n translation key.
// Keep this list in sync with the error codes your backend returns.
const ERROR_CODE_MAP = {
  // Auth — Login
  INVALID_CREDENTIALS: "api_error_invalid_credentials",
  ACCOUNT_LOCKED: "api_error_account_locked",
  EMAIL_NOT_CONFIRMED: "api_error_email_not_confirmed",

  // Auth — OTP
  INVALID_OTP: "api_error_invalid_otp",
  OTP_EXPIRED: "api_error_otp_expired",

  // Auth — Password
  WEAK_PASSWORD: "api_error_weak_password",
  PASSWORD_MISMATCH: "api_error_password_mismatch",
  INVALID_RESET_TOKEN: "api_error_invalid_reset_token",
  RESET_TOKEN_EXPIRED: "api_error_reset_token_expired",

  // General
  UNAUTHORIZED: "api_error_unauthorized",
  FORBIDDEN: "api_error_forbidden",
  NOT_FOUND: "api_error_not_found",
  TOO_MANY_REQUESTS: "too_many_requests",
  INVALID_USER_ID: "api_error_invalid_user_id",
  USER_NOT_FOUND: "api_error_user_not_found",
  SERVER_ERROR: "api_error_server",
};

export const getApiError = (error, fallbackKey = "error_occurred") => {
  const data = error?.response?.data;
  const errorCode = data?.errorCode;
  const validationErrors = data?.errors;

  // 0. Handle model validation payloads (e.g., ASP.NET `errors` object).
  if (validationErrors && typeof validationErrors === "object") {
    const getFieldMessages = (fieldName) => {
      const key = Object.keys(validationErrors).find(
        (k) => k.toLowerCase() === fieldName.toLowerCase(),
      );
      return key ? validationErrors[key] : undefined;
    };

    const newPasswordErrors = getFieldMessages("newpassword");
    if (Array.isArray(newPasswordErrors)) {
      const hasMinLengthError = newPasswordErrors.some((msg) => {
        const normalized = String(msg).toLowerCase();
        return (
          normalized.includes("minimum length") ||
          normalized.includes("at least")
        );
      });

      if (hasMinLengthError) {
        return "password_too_short";
      }
    }
  }

  // 1. Try to find a translation key via the errorCode.
  if (errorCode && ERROR_CODE_MAP[errorCode]) {
    return ERROR_CODE_MAP[errorCode];
  }

  // 2. Handle 429 (rate limiting) which may not have an errorCode.
  if (error?.response?.status === 429) {
    return "too_many_requests";
  }

  // 3. Fallback to the caller-provided key.
  return fallbackKey;
};
