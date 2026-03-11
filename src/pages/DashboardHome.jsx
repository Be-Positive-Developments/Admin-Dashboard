import React from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useTranslation } from "react-i18next";
import {
  Users,
  Activity,
  FileText,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
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

export default function DashboardHome() {
  const { t } = useTranslation();
  useDocumentTitle(t("dashboard", "Dashboard"));

  const data = [
    { name: t("jan", "Jan"), donations: 400 },
    { name: t("feb", "Feb"), donations: 300 },
    { name: t("mar", "Mar"), donations: 600 },
    { name: t("apr", "Apr"), donations: 800 },
    { name: t("may", "May"), donations: 500 },
    { name: t("jun", "Jun"), donations: 900 },
    { name: t("jul", "Jul"), donations: 750 },
  ];

  const recentActivity = [
    {
      id: 1,
      user: "Sarah Johnson",
      action: t("activity_donated", "Made a donation"),
      time: "2 min ago",
      amount: "$50.00",
    },
    {
      id: 2,
      user: "Michael Smith",
      action: t("activity_case_opened", "Opened a new case"),
      time: "15 min ago",
      status: "Active",
    },
    {
      id: 3,
      user: "Emily Davis",
      action: t("activity_donated", "Made a donation"),
      time: "1 hour ago",
      amount: "$25.00",
    },
    {
      id: 4,
      user: "James Wilson",
      action: t("activity_report", "Generated a report"),
      time: "3 hours ago",
    },
    {
      id: 5,
      user: "Jessica Brown",
      action: t("activity_registered", "New user registered"),
      time: "5 hours ago",
    },
  ];

  const stats = [
    {
      title: t("total_users", "Total Users"),
      value: "2,453",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: t("active_cases", "Active Cases"),
      value: "45",
      change: "-2.4%",
      trend: "down",
      icon: Activity,
      color: "bg-red-50 text-red-600",
    },
    {
      title: t("new_reports", "New Reports"),
      value: "12",
      change: "+5.2%",
      trend: "up",
      icon: FileText,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: t("total_donations", "Total Donations"),
      value: "$14,250",
      change: "+18.2%",
      trend: "up",
      icon: DollarSign,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
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
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t("donation_case_trends", "Donation & Case Trends")}
          </h3>
          <div className="h-80 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
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
                  itemStyle={{ color: "#1f2937" }}
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
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#171921] p-6 rounded-xl border border-gray-100 dark:border-[#262833] shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
            {t("recent_activity", "Recent Activity")}
          </h3>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0 ring-4 ring-red-50 dark:ring-red-950"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.user}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {activity.action}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {activity.time}
                    </span>
                    {activity.amount && (
                      <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 px-1.5 py-0.5 rounded">
                        {activity.amount}
                      </span>
                    )}
                    {activity.status && (
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.5 rounded">
                        {activity.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-red-700 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900">
            {t("view_all_activity", "View All Activity")}
          </button>
        </div>
      </div>
    </div>
  );
}
