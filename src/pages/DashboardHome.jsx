import React from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import {
  useGetDashboardStats,
  useGetRecentRegistrations,
  useGetActivityChart,
} from "@/hooks/queries/useDashboard";
import {
  Users,
  Activity,
  Building2,
  ClipboardList,
  HeartPulse,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { motion } from "motion/react";

const STAT_ICONS = {
  totalHospitals: Building2,
  totalDonors: Users,
  totalDonations: HeartPulse,
  totalRequests: ClipboardList,
};

const STAT_COLORS = {
  totalHospitals: "bg-blue-50 text-blue-600",
  totalDonors: "bg-purple-50 text-purple-600",
  totalDonations: "bg-red-50 text-red-600",
  totalRequests: "bg-amber-50 text-amber-600",
};

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
  );
}

function ActivitySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="flex items-start gap-4">
          <div className="h-2 w-2 mt-2 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

const getRegistrationStatusClass = (status) => {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "active") {
    return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950";
  }

  if (normalized === "suspended") {
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950";
  }

  return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950";
};

/* eslint-disable react/prop-types */
function ErrorPanel({ message, onRetry, t }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <AlertCircle size={32} className="text-red-500 mb-3" />
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 text-sm text-red-700 dark:text-red-400 hover:underline"
      >
        <RefreshCw size={14} />
        {t("retry", "Retry")}
      </button>
    </div>
  );
}

export default function DashboardHome() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("dashboard", "Dashboard"));
  const locale = i18n.language;

  const {
    data: stats = [],
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetDashboardStats();

  const {
    data: recentActivity = [],
    isLoading: activityLoading,
    isError: activityError,
    refetch: refetchActivity,
  } = useGetRecentRegistrations({ limit: 5 }, locale);

  const {
    data: chartData = [],
    isLoading: chartLoading,
    isError: chartError,
    refetch: refetchChart,
  } = useGetActivityChart();

  const statCards = stats.map((stat) => ({
    ...stat,
    title: t(stat.titleKey || stat.title, stat.title),
    icon: STAT_ICONS[stat.key] || Activity,
    color: STAT_COLORS[stat.key] || "bg-gray-50 text-gray-600",
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("dashboard_overview", "Dashboard Overview")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t(
              "welcome_admin",
              "Welcome back, Admin. Here's what's happening today.",
            )}
          </p>
        </div>
        <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          {t("generate_report", "Generate Report")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : statsError ? (
          <div className="md:col-span-2 lg:col-span-4">
            <ErrorPanel
              message={t(
                "failed_to_load_dashboard",
                "Failed to load dashboard stats.",
              )}
              onRetry={() => refetchStats()}
              t={t}
            />
          </div>
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={stat.key || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div
                  className={`flex items-center text-xs font-semibold ${stat.trend === "up" ? "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400" : "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400"} px-2 py-1 rounded-full`}
                >
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {stat.formattedChange}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                  {stat.formattedValue}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t(
              "registration_donation_trends",
              "Registration & Donation Trends",
            )}
          </h3>
          {chartLoading ? (
            <ChartSkeleton />
          ) : chartError ? (
            <ErrorPanel
              message={t("failed_to_load_chart", "Failed to load chart data.")}
              onRetry={() => refetchChart()}
              t={t}
            />
          ) : chartData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-16 text-center">
              {t("no_chart_data", "No chart data available.")}
            </p>
          ) : (
            <div className="h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorDonations"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #f3f4f6",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "#000" }}
                    itemStyle={{ color: "#1f2937" }}
                    formatter={(value, name) => [
                      value,
                      t(
                        name === "registrations"
                          ? "registrations"
                          : "donations",
                        name,
                      ),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                  <Area
                    type="monotone"
                    dataKey="donations"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDonations)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t("recent_activity", "Recent Activity")}
          </h3>
          {activityLoading ? (
            <ActivitySkeleton />
          ) : activityError ? (
            <ErrorPanel
              message={t(
                "failed_to_load_activity",
                "Failed to load recent activity.",
              )}
              onRetry={() => refetchActivity()}
              t={t}
            />
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              {t("no_recent_activity", "No recent activity.")}
            </p>
          ) : (
            <div className="space-y-6">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0 ring-4 ring-red-50 dark:ring-red-950" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {activity.user}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {t(activity.action, activity.action)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {activity.time}
                      </span>
                      {activity.location && (
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                          {activity.location}
                        </span>
                      )}
                      {activity.status && (
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded ${getRegistrationStatusClass(
                            activity.status,
                          )}`}
                        >
                          {t(
                            String(activity.status).toLowerCase(),
                            activity.status,
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="w-full mt-6 py-2 text-sm text-red-700 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900">
            {t("view_all_activity", "View All Activity")}
          </button>
        </div>
      </div>
    </div>
  );
}
