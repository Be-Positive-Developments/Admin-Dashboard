import React, { useEffect, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import {
  useCurrentUser,
  useChangeAdminPassword,
} from "@/hooks/queries/useAuth";
import { useUpdateUser } from "@/hooks/queries/useUsers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const resolveFullName = (user) => {
  if (!user) return "";

  const directName =
    user.fullname ||
    user.fullName ||
    user.name ||
    user.username ||
    user.userName;

  if (directName) return String(directName).trim();

  const firstName = user.firstname || user.firstName || "";
  const lastName = user.lastname || user.lastName || "";

  return [firstName, lastName].filter(Boolean).join(" ").trim();
};

const splitFullName = (fullName) => {
  const normalized = String(fullName || "").trim();
  if (!normalized) return { firstName: "", lastName: "" };

  const parts = normalized.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
};

const mapUserTypeToRoleLabel = (userType) => {
  if (userType === "SystemAdmin") return "Admin";
  if (userType === "HospitalAdmin") return "Hospital Admin";
  if (userType === "Donor") return "Donor";
  if (userType === "User") return "User";
  return "User";
};

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("settings", "Settings"));
  const isRtl = i18n.dir() === "rtl";
  const confirmationDurationMs = 4500;
  const [activeTab, setActiveTab] = useState("profile");
  const { data: currentUserResponse, refetch: refetchCurrentUser } =
    useCurrentUser({ refetchOnMount: "always" });
  const currentUser =
    currentUserResponse?.user ||
    currentUserResponse?.User ||
    currentUserResponse?.data ||
    currentUserResponse?.Data ||
    currentUserResponse?.result ||
    currentUserResponse?.Result ||
    currentUserResponse?.value ||
    currentUserResponse?.Value ||
    currentUserResponse;
  const currentUserId =
    currentUser?.id ||
    currentUser?.Id ||
    currentUser?.userId ||
    currentUser?.userid;
  const currentUserType =
    currentUser?.usertype || currentUser?.userType || currentUser?.UserType;
  const currentUserEmail = currentUser?.email || currentUser?.Email || "";
  const currentUserPhone =
    currentUser?.phonenumber ||
    currentUser?.phoneNumber ||
    currentUser?.phone ||
    currentUser?.Phone ||
    "";
  const { mutateAsync: updateUserAsync, isPending: isUpdatingProfile } =
    useUpdateUser(currentUserId);
  const { mutateAsync: changePasswordAsync, isPending: isChangingPassword } =
    useChangeAdminPassword();
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    userType: "",
    roleLabel: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    title: "",
    message: "",
    progress: 100,
    variant: "success",
  });
  const [isProfileDirty, setIsProfileDirty] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: null,
    phone: null,
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    weekly: true,
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return t("email_required", "Email is required.");
    }
    if (!emailRegex.test(email)) {
      return t("invalid_email", "Please enter a valid email.");
    }
    return null;
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[0-9\s()-]{7,20}$/;
    if (!phone) {
      return null;
    }
    if (!phoneRegex.test(phone)) {
      return t("invalid_phone", "Please enter a valid phone number.");
    }
    return null;
  };

  const clearFieldError = (field) => {
    setFormErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleEmailChange = (e) => {
    const email = String(e.target.value || "").trim();
    clearFieldError("email");
    setProfileForm((prev) => ({ ...prev, email }));
    if (!isProfileDirty) {
      setIsProfileDirty(true);
    }
    if (email) {
      const error = validateEmail(email);
      if (error) {
        setFormErrors((prev) => ({ ...prev, email: error }));
      }
    }
  };

  const handlePhoneChange = (e) => {
    const phone = String(e.target.value || "").trim();
    clearFieldError("phone");
    setProfileForm((prev) => ({ ...prev, phone }));
    if (!isProfileDirty) {
      setIsProfileDirty(true);
    }
    if (phone) {
      const error = validatePhone(phone);
      if (error) {
        setFormErrors((prev) => ({ ...prev, phone: error }));
      }
    }
  };

  useEffect(() => {
    if (!currentUser || isProfileDirty) return;

    const fullName = resolveFullName(currentUser);
    const { firstName, lastName } = splitFullName(fullName);
    const userType = currentUserType || "";

    setProfileForm({
      firstName,
      lastName,
      email: currentUserEmail || "",
      phone: currentUserPhone || "",
      userType,
      roleLabel: mapUserTypeToRoleLabel(userType),
    });
  }, [
    currentUser,
    currentUserEmail,
    currentUserPhone,
    currentUserType,
    isProfileDirty,
  ]);

  useEffect(() => {
    if (!confirmationDialog.open) return;

    setConfirmationDialog((prev) => ({ ...prev, progress: 100 }));

    const startTime = Date.now();
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const nextProgress = Math.max(
        0,
        100 - (elapsed / confirmationDurationMs) * 100,
      );

      setConfirmationDialog((prev) =>
        prev.open ? { ...prev, progress: nextProgress } : prev,
      );

      if (nextProgress <= 0) {
        clearInterval(intervalId);
      }
    }, 80);

    const timeoutId = setTimeout(() => {
      setConfirmationDialog((prev) => ({ ...prev, open: false }));
    }, confirmationDurationMs);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [confirmationDialog.open, confirmationDurationMs]);

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileChange = (field) => (event) => {
    const value = event?.target?.value ?? "";
    if (!isProfileDirty) {
      setIsProfileDirty(true);
    }
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = async () => {
    if (!currentUserId) {
      openConfirmationDialog(
        t("profile_update_failed", "Profile update failed"),
        t("missing_user_id", "Unable to update profile right now."),
        "error",
      );
      return;
    }

    const fullName = [profileForm.firstName, profileForm.lastName]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!fullName) {
      openConfirmationDialog(
        t("profile_update_failed", "Profile update failed"),
        t("name_required", "Please enter your name."),
        "error",
      );
      return;
    }

    const email = String(profileForm.email || "").trim();
    const phone = String(profileForm.phone || "").trim();

    if (email) {
      const emailError = validateEmail(email);
      if (emailError) {
        openConfirmationDialog(
          t("profile_update_failed", "Profile update failed"),
          emailError,
          "error",
        );
        return;
      }
    }

    if (phone) {
      const phoneError = validatePhone(phone);
      if (phoneError) {
        openConfirmationDialog(
          t("profile_update_failed", "Profile update failed"),
          phoneError,
          "error",
        );
        return;
      }
    }

    try {
      await updateUserAsync({
        fullname: fullName,
        ...(email ? { email } : {}),
        ...(phone ? { phonenumber: phone } : {}),
      });
      setIsProfileDirty(false);
      await refetchCurrentUser();
      openConfirmationDialog(
        t("profile_updated", "Profile updated"),
        t("profile_updated_desc", "Your profile information has been updated."),
        "success",
      );
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        error?.message ||
        t("settings_save_failed", "Failed to save settings.");
      openConfirmationDialog(
        t("profile_update_failed", "Profile update failed"),
        String(message),
        "error",
      );
    }
  };

  const openConfirmationDialog = (title, message, variant) => {
    setConfirmationDialog({
      open: true,
      title,
      message,
      progress: 100,
      variant,
    });
  };

  const handlePasswordChange = (field) => (event) => {
    const value = event?.target?.value ?? "";
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordSave = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      openConfirmationDialog(
        t("password_update_failed", "Password update failed"),
        t("password_required", "Please fill out all password fields."),
        "error",
      );
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      openConfirmationDialog(
        t("password_update_failed", "Password update failed"),
        t("password_min_length", "New password must be at least 6 characters."),
        "error",
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      openConfirmationDialog(
        t("password_update_failed", "Password update failed"),
        t("password_mismatch", "New password and confirmation do not match."),
        "error",
      );
      return;
    }

    try {
      await changePasswordAsync({
        oldpassword: passwordForm.currentPassword,
        newpassword: passwordForm.newPassword,
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      openConfirmationDialog(
        t("password_updated", "Password updated"),
        t(
          "password_updated_desc",
          "Your password has been updated successfully.",
        ),
        "success",
      );
    } catch (error) {
      const responseData = error?.response?.data;

      let displayMessage = t(
        "password_update_failed",
        "Failed to update password.",
      );

      // If response is a plain string, use it directly
      if (typeof responseData === "string") {
        displayMessage = responseData;
      }
      // If response is an object, extract message from various field names
      else if (responseData && typeof responseData === "object") {
        const apiMessage =
          responseData.message ||
          responseData.Message ||
          responseData.error ||
          responseData.Error ||
          responseData.errorMessage ||
          responseData.ErrorMessage;

        if (apiMessage && typeof apiMessage === "string") {
          displayMessage = apiMessage;
        }
      }

      openConfirmationDialog(
        t("password_update_failed", "Password update failed"),
        displayMessage,
        "error",
      );
    }
  };

  const tabs = [
    {
      id: "profile",
      label: t("profile_settings", "Profile Settings"),
      icon: User,
    },
    {
      id: "notifications",
      label: t("notifications", "Notifications"),
      icon: Bell,
    },
    {
      id: "security",
      label: t("security_privacy", "Security & Privacy"),
      icon: Shield,
    },
    {
      id: "system",
      label: t("system_preferences", "System Preferences"),
      icon: Globe,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("settings", "Settings")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {t(
            "settings_desc",
            "Manage your account preferences and system configuration.",
          )}
        </p>
      </div>

      <div className="bg-white dark:bg-[#171921] rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div
          className={clsx(
            "w-full md:w-64 bg-gray-50 dark:bg-[#0f1117] border-gray-100 dark:border-[#262833] p-2 md:p-4 space-y-1",
            isRtl ? "border-l" : "border-r",
          )}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                activeTab === tab.id
                  ? "bg-white dark:bg-[#1c1e27] text-red-700 dark:text-red-400 shadow-sm ring-1 ring-gray-100 dark:ring-[#262833]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200",
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-700 dark:text-red-400 text-2xl font-bold">
                  AD
                </div>
                <div>
                  <button className="text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:underline">
                    {t("change_avatar", "Change Avatar")}
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("recommended_size", "Recommended size: 256x256px")}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("first_name", "First Name")}
                  </label>
                  <div className="relative">
                    <span
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    >
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      value={profileForm.firstName}
                      onChange={handleProfileChange("firstName")}
                      className={clsx(
                        "w-full py-2 bg-white dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                        isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("last_name", "Last Name")}
                  </label>
                  <div className="relative">
                    <span
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    >
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      value={profileForm.lastName}
                      onChange={handleProfileChange("lastName")}
                      className={clsx(
                        "w-full py-2 bg-white dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                        isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
                      )}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("email_address", "Email Address")}
                  </label>
                  <div className="space-y-1">
                    <div className="relative">
                      <span
                        className={clsx(
                          "absolute inset-y-0 flex items-center text-gray-400",
                          isRtl ? "right-3" : "left-3",
                        )}
                      >
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={handleEmailChange}
                        className={clsx(
                          "w-full py-2 bg-white dark:bg-[#1c1e27] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                          formErrors.email
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-200 dark:border-[#262833]",
                          isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
                        )}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {formErrors.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("phone_number", "Phone Number")}
                  </label>
                  <div className="space-y-1">
                    <div className="relative">
                      <span
                        className={clsx(
                          "absolute inset-y-0 flex items-center text-gray-400",
                          isRtl ? "right-3" : "left-3",
                        )}
                      >
                        <Phone className="h-4 w-4" />
                      </span>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={handlePhoneChange}
                        className={clsx(
                          "w-full py-2 bg-white dark:bg-[#1c1e27] border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                          formErrors.phone
                            ? "border-red-500 dark:border-red-500"
                            : "border-gray-200 dark:border-[#262833]",
                          isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
                        )}
                      />
                    </div>
                    {formErrors.phone && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("role", "Role")}
                  </label>
                  <div className="relative">
                    <span
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    >
                      <Shield className="h-4 w-4" />
                    </span>
                    <input
                      value={profileForm.roleLabel}
                      disabled
                      className={clsx(
                        "w-full py-2 bg-gray-50 dark:bg-[#0f1117] border border-gray-200 dark:border-[#262833] rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed",
                        isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {t("email_notifications", "Email Notifications")}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-[#262833]">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("new_user_registrations", "New User Registrations")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(
                        "new_user_desc",
                        "Receive an email when a new user signs up.",
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotification("email")}
                    dir="ltr"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.email ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-[#262833]">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("urgent_case_alerts", "Urgent Case Alerts")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(
                        "urgent_case_desc",
                        "Get notified immediately for critical cases.",
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotification("push")}
                    dir="ltr"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.push ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.push ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-[#262833]">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t("weekly_reports", "Weekly Reports")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t(
                        "weekly_reports_desc",
                        "Receive a weekly summary of donations and activity.",
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotification("weekly")}
                    dir="ltr"
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.weekly ? "bg-red-600" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.weekly ? "translate-x-6" : "translate-x-1"}`}
                    />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {t("change_password", "Change Password")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("current_password", "Current Password")}
                  </label>
                  <div className="relative">
                    <span
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    >
                      <Lock className="h-4 w-4" />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          current: !prev.current,
                        }))
                      }
                      aria-label={t(
                        "toggle_password",
                        "Toggle password visibility",
                      )}
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600",
                        isRtl ? "left-3" : "right-3",
                      )}
                    >
                      {showPassword.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type={showPassword.current ? "text" : "password"}
                      autoComplete="current-password"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange("currentPassword")}
                      className={clsx(
                        "w-full py-2 bg-white dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                        isRtl ? "pr-10 pl-10" : "pl-10 pr-10",
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("new_password", "New Password")}
                  </label>
                  <div className="relative">
                    <span
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    >
                      <Lock className="h-4 w-4" />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          next: !prev.next,
                        }))
                      }
                      aria-label={t(
                        "toggle_password",
                        "Toggle password visibility",
                      )}
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600",
                        isRtl ? "left-3" : "right-3",
                      )}
                    >
                      {showPassword.next ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type={showPassword.next ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange("newPassword")}
                      className={clsx(
                        "w-full py-2 bg-white dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                        isRtl ? "pr-10 pl-10" : "pl-10 pr-10",
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("confirm_password", "Confirm Password")}
                  </label>
                  <div className="relative">
                    <span
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    >
                      <Lock className="h-4 w-4" />
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          confirm: !prev.confirm,
                        }))
                      }
                      aria-label={t(
                        "toggle_password",
                        "Toggle password visibility",
                      )}
                      className={clsx(
                        "absolute inset-y-0 flex items-center text-gray-400 hover:text-gray-600",
                        isRtl ? "left-3" : "right-3",
                      )}
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange("confirmPassword")}
                      className={clsx(
                        "w-full py-2 bg-white dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                        isRtl ? "pr-10 pl-10" : "pl-10 pr-10",
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handlePasswordSave}
                  disabled={isChangingPassword}
                  className="flex items-center gap-2 bg-red-700 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                  <Save size={16} />
                  {t("update_password", "Update Password")}
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "system" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 text-gray-400"
            >
              <Lock className="h-12 w-12 mb-2 opacity-20" />
              <p>
                {t(
                  "settings_restricted",
                  "Settings for this section are restricted or coming soon.",
                )}
              </p>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#262833] flex justify-end">
              <button
                onClick={handleProfileSave}
                disabled={isUpdatingProfile}
                className="flex items-center gap-2 bg-red-700 hover:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Save size={16} />
                {t("save_changes", "Save Changes")}
              </button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmationDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationDialog.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#262833]">
            <div
              className={clsx(
                "h-full transition-[width] duration-100 ease-linear",
                confirmationDialog.variant === "success"
                  ? "bg-emerald-500"
                  : "bg-red-600",
                isRtl ? "ml-auto" : "",
              )}
              style={{ width: `${confirmationDialog.progress}%` }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction>{t("ok", "OK")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
