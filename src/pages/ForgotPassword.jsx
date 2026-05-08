import React, { useState, useRef, useEffect } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  KeyRound,
  Lightbulb,
} from "lucide-react";
import { clsx } from "clsx";
import { cn } from "@/lib/utils";
import logo from "@/assets/images/be-postive-logo.png";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  useForgotPassword,
  useVerifyPasswordOtp,
  useResetPassword,
  useResendPasswordOtp,
} from "@/hooks/queries/useAuth";
import { getApiError } from "@/lib/apiErrors";

const OTP_LENGTH = 6;
const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("forgot_password", "Forgot Password"));
  const navigate = useNavigate();
  const isRtl = i18n.dir() === "rtl";

  // ─── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState("email"); // 'email' | 'otp' | 'reset' | 'success'
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [emailFieldError, setEmailFieldError] = useState("");
  const [showEmailGuidance, setShowEmailGuidance] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset state
  const [resetToken, setResetToken] = useState(""); // returned by /password/verifyotp
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordGuidance, setShowPasswordGuidance] = useState(false);
  const [passwordLengthError, setPasswordLengthError] = useState(false);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const forgotMutation = useForgotPassword();
  const verifyOtpMutation = useVerifyPasswordOtp();
  const resetMutation = useResetPassword();
  const resendOtpMutation = useResendPasswordOtp();

  const isLoading =
    forgotMutation.isPending ||
    verifyOtpMutation.isPending ||
    resetMutation.isPending;
  const remainingPasswordChars = Math.max(
    0,
    MIN_PASSWORD_LENGTH - newPassword.length,
  );
  const isPasswordLengthValid = remainingPasswordChars === 0;

  // ─── Resend cooldown timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  /** Step 1 — send OTP to email */
  const handleSendCode = (e) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailFieldError("auth_email_required");
      setShowEmailGuidance(true);
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailFieldError("auth_email_invalid");
      setShowEmailGuidance(true);
      return;
    }

    forgotMutation.mutate(trimmedEmail, {
      onSuccess: () => {
        setStep("otp");
        setOtp(Array(OTP_LENGTH).fill(""));
        setResendCooldown(60);
      },
      onError: (err) => {
        setError(getApiError(err));
      },
    });
  };

  /** Step 2 — verify OTP */
  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    setError("");
    const otpCode = otp.join("");

    if (otpCode.length < OTP_LENGTH) return;

    verifyOtpMutation.mutate(
      { email, otp: otpCode },
      {
        onSuccess: (data) => {
          // The server returns a short-lived reset token we must use in the next step.
          // Backend field name is "resettoken" (all lowercase).
          setResetToken(data?.resettoken ?? "");
          setStep("reset");
        },
        onError: (err) => {
          setError(getApiError(err, "invalid_otp"));
          setOtp(Array(OTP_LENGTH).fill(""));
          otpRefs.current[0]?.focus();
        },
      },
    );
  };

  /** Step 3 — reset password */
  const handleResetPassword = (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordLengthError(true);
      setShowPasswordGuidance(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("passwords_dont_match");
      return;
    }

    resetMutation.mutate(
      { email, token: resetToken, newPassword },
      {
        onSuccess: () => setStep("success"),
        onError: (err) => {
          setError(getApiError(err));
        },
      },
    );
  };

  /** Resend OTP */
  const handleResendOtp = () => {
    if (resendCooldown > 0 || resendOtpMutation.isPending) return;

    resendOtpMutation.mutate(email, {
      onSuccess: () => setResendCooldown(60),
      onError: (err) => {
        setError(getApiError(err));
      },
    });
  };

  /** Change email — go back to step 1 */
  const handleChangeEmail = () => {
    setStep("email");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
  };

  // ─── OTP Input Handlers ─────────────────────────────────────────────────────

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    if (value && index === OTP_LENGTH - 1 && newOtp.every((d) => d !== "")) {
      setTimeout(() => handleVerifyOtp(), 50);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => (newOtp[i] = char));
    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    otpRefs.current[nextIndex]?.focus();

    if (pasted.length === OTP_LENGTH) {
      setTimeout(() => handleVerifyOtp(), 50);
    }
  };

  // ─── Step titles ────────────────────────────────────────────────────────────

  const stepConfig = {
    email: {
      icon: <Mail className="h-8 w-8 text-red-500" />,
      title: t("forgot_password", "Forgot Password"),
      subtitle: t(
        "forgot_password_desc",
        "Enter your email and we will send you a verification code",
      ),
    },
    otp: {
      icon: <ShieldCheck className="h-8 w-8 text-red-500" />,
      title: t("enter_verification_code", "Enter Verification Code"),
      subtitle: (
        <>
          {t("otp_sent_to", "We sent a verification code to")}
          <br />
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {email}
          </span>
        </>
      ),
    },
    reset: {
      icon: <KeyRound className="h-8 w-8 text-red-500" />,
      title: t("set_new_password", "Set New Password"),
      subtitle: t(
        "set_new_password_desc",
        "Your new password must be different from previously used passwords",
      ),
    },
    success: {
      icon: <CheckCircle2 className="h-8 w-8 text-green-500" />,
      title: t("password_reset_success", "Password Reset Successful"),
      subtitle: t(
        "password_reset_success_desc",
        "Your password has been reset successfully. You can now log in with your new password.",
      ),
    },
  };

  const current = stepConfig[step];

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-[#0f1117] flex items-center justify-center p-4 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Language Switcher */}
      <div
        className={clsx("absolute top-4 z-50", isRtl ? "left-4" : "right-4")}
      >
        <LanguageSwitcher />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-red-100 dark:bg-red-950/30 mix-blend-multiply dark:mix-blend-lighten filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gray-200 dark:bg-gray-800/30 mix-blend-multiply dark:mix-blend-lighten filter blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-[#171921] rounded-2xl shadow-xl border border-gray-100 dark:border-[#262833] overflow-hidden relative z-10"
      >
        <div className="p-8 pb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.1,
              }}
              className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 dark:bg-white mb-4 shadow-inner dark:shadow-none dark:ring-1 dark:ring-gray-200"
            >
              <img
                src={logo}
                alt="Be Positive Logo"
                className="h-12 w-12 object-contain"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-center mb-2">{current.icon}</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {current.title}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                  {current.subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-900 mb-5"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{t(error)}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {/* ─── Step 1: Enter Email ─────────────────────────────────────── */}
            {step === "email" && (
              <motion.form
                key="email-form"
                initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSendCode}
                noValidate
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("email", "Email Address")}
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-y-0 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500",
                        isRtl ? "right-0 pr-3" : "left-0 pl-3",
                      )}
                    >
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onFocus={() => setShowEmailGuidance(true)}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailFieldError("");
                      }}
                      className={cn(
                        "block w-full py-2.5 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 dark:bg-[#1c1e27] dark:text-gray-200 focus:bg-white dark:focus:bg-[#22242e] outline-none",
                        isRtl ? "pr-10 pl-3" : "pl-10 pr-3",
                      )}
                      placeholder="admin@bepositive.org"
                      required
                    />
                  </div>

                  <AnimatePresence>
                    {(showEmailGuidance || email || emailFieldError) && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={cn(
                          "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                          emailFieldError
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                            : email && EMAIL_REGEX.test(email.trim())
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                        )}
                      >
                        {emailFieldError ? (
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : email && EMAIL_REGEX.test(email.trim()) ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <span>
                          {emailFieldError
                            ? t(emailFieldError)
                            : email && EMAIL_REGEX.test(email.trim())
                              ? t("auth_email_ready", "Email looks good.")
                              : t(
                                  "auth_email_hint",
                                  "Use your account email to continue.",
                                )}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={clsx(
                    "w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                    isLoading && "opacity-75 cursor-wait",
                  )}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t("send_code", "Send Verification Code")
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
                  {t("back_to_login", "Back to login")}
                </Link>
              </motion.form>
            )}

            {/* ─── Step 2: OTP Verification ────────────────────────────────── */}
            {step === "otp" && (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleVerifyOtp}
                className="space-y-6"
              >
                {/* OTP Inputs */}
                <div className="flex justify-center gap-2" dir="ltr">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 dark:bg-[#1c1e27] dark:text-gray-200 focus:bg-white dark:focus:bg-[#22242e] outline-none"
                    />
                  ))}
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("didnt_receive_code", "Didn't receive the code?")}
                  </p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || resendOtpMutation.isPending}
                    className="mt-1 text-sm font-medium text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed inline-flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5",
                        resendOtpMutation.isPending && "animate-spin",
                      )}
                    />
                    {resendCooldown > 0
                      ? `${t("resend_in", "Resend in")} ${resendCooldown}s`
                      : t("resend_code", "Resend code")}
                  </button>
                </div>

                {/* Verify button */}
                <button
                  type="submit"
                  disabled={isLoading || otp.some((d) => !d)}
                  className={clsx(
                    "w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                    isLoading && "opacity-75 cursor-wait",
                  )}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t("verify", "Verify")
                  )}
                </button>

                {/* Change email */}
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
                  {t("change_email", "Change email")}
                </button>
              </motion.form>
            )}

            {/* ─── Step 3: New Password ────────────────────────────────────── */}
            {step === "reset" && (
              <motion.form
                key="reset-form"
                initial={{ opacity: 0, x: isRtl ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleResetPassword}
                noValidate
                className="space-y-5"
              >
                {/* New Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("new_password", "New Password")}
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-y-0 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500",
                        isRtl ? "right-0 pr-3" : "left-0 pl-3",
                      )}
                    >
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onFocus={() => setShowPasswordGuidance(true)}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (
                          passwordLengthError &&
                          e.target.value.length >= MIN_PASSWORD_LENGTH
                        ) {
                          setPasswordLengthError(false);
                        }
                      }}
                      className={cn(
                        "block w-full py-2.5 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 dark:bg-[#1c1e27] dark:text-gray-200 focus:bg-white dark:focus:bg-[#22242e] outline-none",
                        isRtl ? "pr-10 pl-10" : "pl-10 pr-10",
                      )}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className={cn(
                        "absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors",
                        isRtl ? "left-0 pl-3" : "right-0 pr-3",
                      )}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {(showPasswordGuidance ||
                      newPassword ||
                      passwordLengthError) && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={cn(
                          "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                          passwordLengthError
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                            : isPasswordLengthValid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                        )}
                      >
                        {isPasswordLengthValid ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <span>
                          {isPasswordLengthValid
                            ? t(
                                "password_length_ready",
                                "Perfect length. You can continue.",
                              )
                            : passwordLengthError
                              ? t(
                                  "password_too_short",
                                  "Password must be at least 8 characters.",
                                )
                              : t(
                                  "password_length_remaining",
                                  "Add {{count}} more character(s) to reach {{min}}.",
                                  {
                                    count: remainingPasswordChars,
                                    min: MIN_PASSWORD_LENGTH,
                                  },
                                )}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("confirm_password", "Confirm Password")}
                  </label>
                  <div className="relative group">
                    <div
                      className={cn(
                        "absolute inset-y-0 flex items-center pointer-events-none transition-colors group-focus-within:text-red-500",
                        isRtl ? "right-0 pr-3" : "left-0 pl-3",
                      )}
                    >
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        "block w-full py-2.5 border border-gray-300 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all bg-gray-50 dark:bg-[#1c1e27] dark:text-gray-200 focus:bg-white dark:focus:bg-[#22242e] outline-none",
                        isRtl ? "pr-10 pl-10" : "pl-10 pr-10",
                      )}
                      placeholder="••••••••"
                      minLength={MIN_PASSWORD_LENGTH}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className={cn(
                        "absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors",
                        isRtl ? "left-0 pl-3" : "right-0 pr-3",
                      )}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={clsx(
                    "w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed",
                    isLoading && "opacity-75 cursor-wait",
                  )}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    t("reset_password", "Reset Password")
                  )}
                </button>
              </motion.form>
            )}

            {/* ─── Step 4: Success ─────────────────────────────────────────── */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-5"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-950/40"
                >
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </motion.div>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                >
                  {t("go_to_login", "Go to Login")}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
