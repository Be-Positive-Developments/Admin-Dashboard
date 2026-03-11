import React, { useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import { User, Bell, Shield, Globe, Save, Mail, Lock } from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { toast } from "sonner";

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("settings", "Settings"));
  const isRtl = i18n.dir() === "rtl";
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    weekly: true,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
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
                    <User
                      className={clsx(
                        "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    />
                    <input
                      defaultValue="Admin"
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
                    <User
                      className={clsx(
                        "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    />
                    <input
                      defaultValue="User"
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
                  <div className="relative">
                    <Mail
                      className={clsx(
                        "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    />
                    <input
                      defaultValue="admin@bepositive.org"
                      className={clsx(
                        "w-full py-2 bg-white dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none dark:text-gray-200",
                        isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
                      )}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t("role", "Role")}
                  </label>
                  <div className="relative">
                    <Shield
                      className={clsx(
                        "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400",
                        isRtl ? "right-3" : "left-3",
                      )}
                    />
                    <input
                      defaultValue="Super Administrator"
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

          {/* Placeholder for other tabs */}
          {(activeTab === "security" || activeTab === "system") && (
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

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#262833] flex justify-end">
            <button
              onClick={() =>
                toast.success(
                  t("settings_saved", "Settings saved successfully"),
                )
              }
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Save size={16} />
              {t("save_changes", "Save Changes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
