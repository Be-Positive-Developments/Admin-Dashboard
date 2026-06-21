import React, { useMemo, useState } from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import { useGetDonors, useGetDonorStats } from "@/hooks/queries/useDonations";
import {
  getDonorStatusStyles,
  getDonorStatusTranslationKey,
} from "@/services/donations.service";
import {
  Heart,
  Download,
  TrendingUp,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const STATUS_FILTERS = ["All", "Active", "Eligible", "Ineligible", "Inactive"];

const STAT_ICONS = {
  totalDonors: Heart,
  eligibleDonors: User,
  recentDonors: Calendar,
  inactiveDonors: Users,
};

const mapFilterToApiStatus = (filter) => {
  if (filter === "All") return undefined;
  return filter;
};

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#171921] p-5 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm flex items-center gap-4 animate-pulse">
      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function DonorListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between p-3 rounded-lg border border-transparent"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded ml-auto" />
            <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

export default function DonationsPage() {
  const { t, i18n } = useTranslation();
  useDocumentTitle(t("donors", "Donors"));
  const [filter, setFilter] = useState("All");
  const locale = i18n.language;

  const apiParams = useMemo(
    () => ({
      status: mapFilterToApiStatus(filter),
      page: 1,
      limit: 10,
    }),
    [filter],
  );

  const {
    data: donorStats = [],
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useGetDonorStats();

  const {
    data: donorsData,
    isLoading: donorsLoading,
    isError: donorsError,
    refetch: refetchDonors,
  } = useGetDonors(apiParams, locale);

  const donors = useMemo(() => donorsData?.donors ?? [], [donorsData?.donors]);

  const chartData = useMemo(() => {
    const grouped = donors.reduce((acc, donor) => {
      const key = donor.bloodType || "Unknown";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, amount]) => ({ name, amount }));
  }, [donors]);

  const statCards = donorStats.map((stat) => ({
    ...stat,
    title: t(stat.titleKey || stat.title, stat.title),
    icon: STAT_ICONS[stat.key] || Heart,
    color: stat.iconColor || "text-red-600 bg-red-50",
  }));

  const renderStatusIcon = (status) => {
    const styles = getDonorStatusStyles(status);
    if (styles.icon === "completed") {
      return <CheckCircle size={12} className="text-green-500" />;
    }
    if (styles.icon === "failed") {
      return <XCircle size={12} className="text-red-500" />;
    }
    return <Clock size={12} className="text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("donors_overview", "Donors Overview")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t(
              "donors_desc",
              "Monitor blood donor activity and eligibility across the system.",
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-[#171921] border border-gray-200 dark:border-[#262833] hover:bg-gray-50 dark:hover:bg-[#1c1e27] text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download size={16} />
          {t("export_csv", "Export CSV")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                "failed_to_load_donors",
                "Failed to load donor stats.",
              )}
              onRetry={() => refetchStats()}
              t={t}
            />
          </div>
        ) : (
          statCards.map((stat, index) => (
            <motion.div
              key={stat.key || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-[#171921] p-5 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div
                className={clsx(
                  "p-3 rounded-lg flex items-center justify-center shrink-0",
                  stat.color,
                )}
              >
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-0.5">
                  {stat.formattedValue}
                </h3>
                <p className="text-xs font-medium text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp size={10} /> {stat.formattedChange}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {t("donors_by_blood_type", "Donors by Blood Type")}
            </h3>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="bg-gray-50 dark:bg-[#1c1e27] border border-gray-200 dark:border-[#262833] text-gray-700 dark:text-gray-300 text-xs rounded-lg p-2 focus:ring-red-500 focus:border-red-500 outline-none"
            >
              {STATUS_FILTERS.map((status) => (
                <option key={status} value={status}>
                  {status === "All"
                    ? t("all", "All")
                    : t(getDonorStatusTranslationKey(status), status)}
                </option>
              ))}
            </select>
          </div>
          {donorsLoading ? (
            <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ) : donorsError ? (
            <ErrorPanel
              message={t("failed_to_load_chart", "Failed to load chart data.")}
              onRetry={() => refetchDonors()}
              t={t}
            />
          ) : chartData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-16 text-center">
              {t("no_chart_data", "No chart data available.")}
            </p>
          ) : (
            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorAmount"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
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
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #f3f4f6",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "#000" }}
                    itemStyle={{ color: "#16a34a", fontWeight: 600 }}
                    formatter={(value) => [
                      value,
                      t("donors_count_label", "Donors"),
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#16a34a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t("recent_donors", "Recent Donors")}
          </h3>
          {donorsLoading ? (
            <DonorListSkeleton />
          ) : donorsError ? (
            <ErrorPanel
              message={t(
                "failed_to_load_donors",
                "Failed to load donor stats.",
              )}
              onRetry={() => refetchDonors()}
              t={t}
            />
          ) : donors.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              {t("no_donors_found", "No donors found matching your filters.")}
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-96">
              {donors.map((donor) => {
                const statusStyles = getDonorStatusStyles(donor.status);
                return (
                  <div
                    key={donor.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1c1e27] transition-colors border border-transparent hover:border-gray-100 dark:hover:border-[#262833]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold text-xs ring-2 ring-white dark:ring-[#171921]">
                        {donor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {donor.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {donor.bloodType} • {donor.relativeTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {donor.donationsCount}
                      </p>
                      <div className="flex items-center justify-end gap-1.5 mt-1">
                        {renderStatusIcon(donor.status)}
                        <span
                          className={clsx(
                            "text-[10px] font-semibold uppercase tracking-wider",
                            statusStyles.text,
                          )}
                        >
                          {t(
                            getDonorStatusTranslationKey(donor.status),
                            donor.status,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button className="w-full mt-4 py-2 text-sm text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-[#1c1e27] rounded-lg transition-colors border border-gray-200 dark:border-[#262833] hover:border-gray-300 dark:hover:border-[#363842]">
            {t("view_all_donors", "View All Donors")}
          </button>
        </div>
      </div>
    </div>
  );
}
