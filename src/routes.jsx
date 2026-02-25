import { createBrowserRouter } from "react-router";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/DashboardHome";
import UsersPage from "@/pages/Users";
import CasesPage from "@/pages/Cases";
import AnalyticsPage from "@/pages/Analytics";
import SettingsPage from "@/pages/Settings";
import ReportsPage from "@/pages/Reports";
import DonationsPage from "@/pages/Donations";
import LoginPage from "@/pages/Login";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
{
  path: "/login",
  Component: LoginPage
},
{
  path: "/",
  Component: DashboardLayout,
  children: [
  { index: true, Component: DashboardHome },
  { path: "users", Component: UsersPage },
  { path: "cases", Component: CasesPage },
  { path: "reports", Component: ReportsPage },
  { path: "donations", Component: DonationsPage },
  { path: "analytics", Component: AnalyticsPage },
  { path: "settings", Component: SettingsPage },
  { path: "*", Component: NotFound }]

}]
);