import React from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import {
  useGetAnalyticsSummary,
  useGetDonationsTrend,
  useGetBloodTypeDemand,
} from "@/hooks/queries/useAnalytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowUp,
  ArrowDown,
  Download,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
];

function KpiSkeleton() {
  return (
    <div className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm animate-pulse">
      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="mt-4 flex items-baseline gap-2">
        <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-5 w-14 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-80 w-full bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
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

export default function AnalyticsPage() {
  const { t } = useTranslation();
  useDocumentTitle(t("analytics", "Analytics"));

  const {
    data: kpis = [],
    isLoading: kpisLoading,
    isError: kpisError,
    refetch: refetchKpis,
  } = useGetAnalyticsSummary();

  const {
    data: trendData = [],
    isLoading: trendLoading,
    isError: trendError,
    refetch: refetchTrend,
  } = useGetDonationsTrend();

  const {
    data: bloodTypeData = [],
    isLoading: bloodTypeLoading,
    isError: bloodTypeError,
    refetch: refetchBloodType,
  } = useGetBloodTypeDemand();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("analytics_reports", "Analytics & Reports")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {t(
              "analytics_desc",
              "Deep dive into your donation metrics and user growth.",
            )}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-[#171921] border border-gray-200 dark:border-[#262833] hover:bg-gray-50 dark:hover:bg-[#1c1e27] text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download size={16} />
          {t("export_data", "Export Data")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpisLoading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : kpisError ? (
          <div className="md:col-span-3">
            <ErrorPanel
              message={t(
                "failed_to_load_analytics",
                "Failed to load analytics summary.",
              )}
              onRetry={() => refetchKpis()}
              t={t}
            />
          </div>
        ) : (
          kpis.map((kpi) => (
            <div
              key={kpi.key}
              className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm"
            >
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t(kpi.titleKey || kpi.title, kpi.title)}
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {kpi.formattedValue}
                </span>
                {kpi.formattedChange && (
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded flex items-center ${
                      kpi.trend === "up"
                        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50"
                        : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50"
                    }`}
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUp size={12} className="mr-0.5" />
                    ) : (
                      <ArrowDown size={12} className="mr-0.5" />
                    )}
                    {kpi.formattedChange}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t("donations_vs_requests", "Donations vs Requests")}
          </h3>
          {trendLoading ? (
            <ChartSkeleton />
          ) : trendError ? (
            <ErrorPanel
              message={t("failed_to_load_chart", "Failed to load chart data.")}
              onRetry={() => refetchTrend()}
              t={t}
            />
          ) : trendData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-16 text-center">
              {t("no_chart_data", "No chart data available.")}
            </p>
          ) : (
            <div className="h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={trendData}>
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
                    formatter={(value, name) => [
                      value,
                      t(name === "requests" ? "requests" : "donations", name),
                    ]}
                  />
                  <Legend
                    formatter={(value) =>
                      t(value === "requests" ? "requests" : "donations", value)
                    }
                  />
                  <Line
                    type="monotone"
                    name="donations"
                    dataKey="donations"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#ef4444" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    name="requests"
                    dataKey="requests"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t("blood_type_demand", "Blood Type Demand")}
          </h3>
          {bloodTypeLoading ? (
            <ChartSkeleton />
          ) : bloodTypeError ? (
            <ErrorPanel
              message={t("failed_to_load_chart", "Failed to load chart data.")}
              onRetry={() => refetchBloodType()}
              t={t}
            />
          ) : bloodTypeData.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-16 text-center">
              {t("no_chart_data", "No chart data available.")}
            </p>
          ) : (
            <div className="h-80 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={bloodTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {bloodTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.key || index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
