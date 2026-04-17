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
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { clsx } from "clsx";
import { cn } from "@/lib/utils";
import { getApiError } from "@/lib/apiErrors";
import { setRememberMe, storeTokens } from "@/lib/sessionManager";
import logo from "@/assets/images/be-postive-logo.png";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  useLogin,
  useVerifyLoginOtp,
  useResendLoginOtp,
} from "@/hooks/queries/useAuth";

const OTP_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("login", "Login"));
  const navigate = useNavigate();
  const isRtl = i18n.dir() === "rtl";

  // ─── State ──────────────────────────────────────────────────────────────────
  const [step, setStep] = useState("credentials"); // 'credentials' | 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMeChecked] = useState(false);
  const [loginFieldErrors, setLoginFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [showFieldGuidance, setShowFieldGuidance] = useState({
    email: false,
    password: false,
  });

  // OTP state
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const loginMutation = useLogin();
  const verifyOtpMutation = useVerifyLoginOtp();
  const resendOtpMutation = useResendLoginOtp();

  const isLoading = loginMutation.isPending || verifyOtpMutation.isPending;

  // ─── Resend cooldown timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const validateCredentials = () => {
    const nextErrors = { email: "", password: "" };

    if (!email.trim()) {
      nextErrors.email = "auth_email_required";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "auth_email_invalid";
    }

    if (!password) {
      nextErrors.password = "auth_password_required";
    }

    return nextErrors;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const nextErrors = validateCredentials();
    setLoginFieldErrors(nextErrors);

    if (nextErrors.email || nextErrors.password) {
      setShowFieldGuidance({ email: true, password: true });
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          // 200 — direct login success
          if (data?.auth) {
            setRememberMe(rememberMe);
            storeTokens(data.auth);
            navigate("/");
            return;
          }

          // 202 — OTP required (2FA or email not confirmed)
          if (
            data?.verification?.requiresOtpVerification ||
            data?.verification?.emailConfirmed === false
          ) {
            setStep("otp");
            setOtp(Array(OTP_LENGTH).fill(""));
            setResendCooldown(60);
          }
        },
        onError: (err) => {
          setError(getApiError(err, "invalid_email_or_password"));
        },
      },
    );
  };

  const handleVerifyOtp = (e) => {
    e?.preventDefault();
    setError("");
    const otpCode = otp.join("");

    if (otpCode.length < OTP_LENGTH) return;

    verifyOtpMutation.mutate(
      { email, otp: otpCode },
      {
        onSuccess: (data) => {
          if (data?.auth) {
            // Set remember-me preference BEFORE storing tokens
            // so they go into the correct storage.
            setRememberMe(rememberMe);
            storeTokens(data.auth);
            navigate("/");
          }
        },
        onError: (err) => {
          setError(getApiError(err, "invalid_otp"));
          setOtp(Array(OTP_LENGTH).fill(""));
          otpRefs.current[0]?.focus();
        },
      },
    );
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0 || resendOtpMutation.isPending) return;

    resendOtpMutation.mutate(email, {
      onSuccess: () => setResendCooldown(60),
      onError: (err) => {
        setError(getApiError(err));
      },
    });
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
  };

  // ─── OTP Input Handlers ─────────────────────────────────────────────────────

  const handleOtpChange = (index, value) => {
    // Accept only digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
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
              {step === "credentials" ? (
                <motion.div
                  key="credentials-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {t("welcome_back", "Welcome Back")}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    {t(
                      "enter_credentials",
                      "Enter your credentials to access your account",
                    )}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="otp-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {t("verify_identity", "Verify Your Identity")}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
                    {t("otp_sent_to", "We sent a verification code to")}
                    <br />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {email}
                    </span>
                  </p>
                </motion.div>
              )}
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
            {/* ─── Step 1: Credentials ──────────────────────────────────────── */}
            {step === "credentials" && (
              <motion.form
                key="credentials-form"
                initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRtl ? -20 : 20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleLogin}
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
                      onFocus={() =>
                        setShowFieldGuidance((prev) => ({
                          ...prev,
                          email: true,
                        }))
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setEmail(value);
                        setLoginFieldErrors((prev) => ({
                          ...prev,
                          email: "",
                        }));
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
                    {(showFieldGuidance.email || email || loginFieldErrors.email) && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={cn(
                          "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                          loginFieldErrors.email
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                            : email && EMAIL_REGEX.test(email.trim())
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                        )}
                      >
                        {loginFieldErrors.email ? (
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : email && EMAIL_REGEX.test(email.trim()) ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <span>
                          {loginFieldErrors.email
                            ? t(loginFieldErrors.email)
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

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t("password", "Password")}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline"
                    >
                      {t("forgot_password", "Forgot password?")}
                    </Link>
                  </div>
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
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onFocus={() =>
                        setShowFieldGuidance((prev) => ({
                          ...prev,
                          password: true,
                        }))
                      }
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLoginFieldErrors((prev) => ({
                          ...prev,
                          password: "",
                        }));
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
                      onClick={() => setShowPassword(!showPassword)}
                      className={cn(
                        "absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none transition-colors",
                        isRtl ? "left-0 pl-3" : "right-0 pr-3",
                      )}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <AnimatePresence>
                    {(showFieldGuidance.password || password || loginFieldErrors.password) && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={cn(
                          "mt-2 rounded-lg border px-3 py-2 text-xs flex items-start gap-2",
                          loginFieldErrors.password
                            ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900"
                            : password
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
                        )}
                      >
                        {loginFieldErrors.password ? (
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : password ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                        ) : (
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
                        )}
                        <span>
                          {loginFieldErrors.password
                            ? t(loginFieldErrors.password)
                            : password
                              ? t("auth_password_ready", "Password entered.")
                              : t(
                                  "auth_password_hint",
                                  "Enter your account password.",
                                )}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMeChecked(e.target.checked)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer accent-red-600"
                  />
                  <label
                    htmlFor="remember-me"
                    className={cn(
                      "block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none",
                      isRtl ? "mr-2" : "ml-2",
                    )}
                  >
                    {t("remember_me", "Remember me for 30 days")}
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={clsx(
                    "w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2",
                    isLoading && "opacity-75 cursor-wait",
                  )}
                >
                  {isLoading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      {t("signin", "Sign In")}{" "}
                      <ArrowRight
                        className={cn("h-4 w-4", isRtl && "rotate-180")}
                      />
                    </span>
                  )}
                </button>
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
                <div className="flex justify-center items-center mb-2">
                  <ShieldCheck className="h-8 w-8 text-red-500" />
                </div>

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

                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBackToCredentials}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft className={cn("h-4 w-4", isRtl && "rotate-180")} />
                  {t("back_to_login", "Back to login")}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
