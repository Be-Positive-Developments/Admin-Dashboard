import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import {
  login,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  verifyPasswordOtp,
  resetPassword,
  resendPasswordOtp,
  logout,
  getCurrentUser,
} from "@/services/auth.service";
import { isAuthenticated, clearTokens } from "@/lib/sessionManager";

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const authKeys = {
  me: ["auth", "me"],
};

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetch the currently authenticated user.
 * Only runs when a token exists in localStorage.
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getCurrentUser,
    enabled: isAuthenticated(),
  });
};

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Login mutation.
 * On 200 → tokens stored automatically in auth.service.
 * On 202 → caller reads data.verification.requiresOtpVerification.
 */
export const useLogin = () => {
  return useMutation({ mutationFn: login });
};

/**
 * Verify OTP during login (2FA or email not confirmed).
 */
export const useVerifyLoginOtp = () => {
  return useMutation({ mutationFn: verifyLoginOtp });
};

/**
 * Resend login OTP.
 */
export const useResendLoginOtp = () => {
  return useMutation({ mutationFn: resendLoginOtp });
};

/**
 * Step 1 of forgot password — send OTP to email.
 */
export const useForgotPassword = () => {
  return useMutation({ mutationFn: forgotPassword });
};

/**
 * Step 2 — verify the password reset OTP.
 */
export const useVerifyPasswordOtp = () => {
  return useMutation({ mutationFn: verifyPasswordOtp });
};

/**
 * Step 3 — set the new password using the reset token.
 */
export const useResetPassword = () => {
  return useMutation({ mutationFn: resetPassword });
};

/**
 * Resend password reset OTP.
 */
export const useResendPasswordOtp = () => {
  return useMutation({ mutationFn: resendPasswordOtp });
};

/**
 * Logout — calls server endpoint, clears tokens + query cache,
 * then navigates to /login.
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
      navigate("/login");
    },
  });
};
