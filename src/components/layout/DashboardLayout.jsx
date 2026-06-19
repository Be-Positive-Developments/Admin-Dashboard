import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useLogout, useCurrentUser } from "@/hooks/queries/useAuth";
import {
  LayoutDashboard,
  Users,
  FileText,
  PieChart,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronLeft,
  Search,
  Heart,
  BriefcaseMedical,
  Building2,
} from "lucide-react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import logo from "@/assets/images/be-postive-logo.png";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSwitcher } from "./ThemeSwitcher";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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

const getInitials = (firstName, lastName) => {
  const first = (firstName || "").trim().charAt(0).toUpperCase();
  const last = (lastName || "").trim().charAt(0).toUpperCase();
  return (first + last) || "AD";
};

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const logoutMutation = useLogout();

  const navItems = [
    { name: t("dashboard", "Dashboard"), icon: LayoutDashboard, path: "/" },
    { name: t("users", "Users"), icon: Users, path: "/users" },
    {
      name: t("hospital_requests", "Hospital Requests"),
      icon: Building2,
      path: "/hospital-requests",
    },
    { name: t("cases", "Cases"), icon: BriefcaseMedical, path: "/cases" },
    { name: t("reports", "Reports"), icon: FileText, path: "/reports" },
    { name: t("donations", "Donations"), icon: Heart, path: "/donations" },
    { name: t("analytics", "Analytics"), icon: PieChart, path: "/analytics" },
    { name: t("settings", "Settings"), icon: Settings, path: "/settings" },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 256 : isMobile ? 0 : 80,
        x: isMobile && !isOpen ? (isRtl ? 256 : -256) : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed start-0 top-0 z-40 h-screen bg-white dark:bg-[#0c0e14] shadow-xl overflow-hidden border-e border-gray-100 dark:border-[#262833] flex flex-col",
        isMobile ? "absolute" : "relative",
      )}
    >
      <div className="flex items-center h-16 px-3 border-b border-gray-100 dark:border-[#262833] justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 overflow-hidden whitespace-nowrap"
        >
          {/* Logo Icon */}
          <div className="w-10 h-10 flex items-center justify-center shrink-0 dark:bg-white dark:rounded-full dark:p-1.5">
            <img
              src={logo}
              alt="Be Positive Logo"
              className="h-full w-full object-contain"
            />
          </div>
          <motion.span
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
              display: isOpen ? "block" : "none",
            }}
            className="font-bold text-xl text-gray-900 dark:text-gray-100 tracking-tight"
          >
            Be <span className="text-[#bf0d0d]">Positive</span>
          </motion.span>
        </Link>
        {!isMobile && isOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <ChevronLeft
              size={20}
              className={cn(
                "transform transition-transform",
                isRtl && "rotate-180",
              )}
            />
          </button>
        )}
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive
                  ? "bg-[#bf0d0d]/10 text-[#bf0d0d]"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute start-0 top-0 bottom-0 w-1 bg-[#bf0d0d] rounded-e-full"
                />
              )}
              <item.icon
                size={22}
                className={cn("flex-shrink-0", isActive && "text-[#bf0d0d]")}
              />
              <motion.span
                initial={false}
                animate={{
                  opacity: isOpen ? 1 : 0,
                  display: isOpen ? "block" : "none",
                }}
                className="font-medium whitespace-nowrap"
              >
                {item.name}
              </motion.span>

              {!isOpen && !isMobile && (
                <div
                  className={cn(
                    "absolute bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap z-[100]",
                    isRtl ? "right-16" : "left-16",
                  )}
                >
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-[#262833]">
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className={cn(
            "flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-colors text-red-600 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed",
            !isOpen && "justify-center",
          )}
        >
          <LogOut size={22} className="flex-shrink-0" />
          <motion.span
            initial={false}
            animate={{
              opacity: isOpen ? 1 : 0,
              display: isOpen ? "block" : "none",
            }}
            className="font-medium whitespace-nowrap"
          >
            {t("logout", "Logout")}
          </motion.span>
        </button>
      </div>
    </motion.aside>
  );
};

// Top Navigation
const TopNav = ({ toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { data: currentUserResponse } = useCurrentUser();
  const [adminName, setAdminName] = useState("");
  const [adminInitials, setAdminInitials] = useState("AD");

  useEffect(() => {
    if (!currentUserResponse) return;

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

    const fullName = resolveFullName(currentUser) || "Admin";
    const { firstName, lastName } = splitFullName(fullName);
    const initials = getInitials(firstName, lastName);

    setAdminName(fullName);
    setAdminInitials(initials);
  }, [currentUserResponse]);

  return (
    <header className="h-16 bg-white dark:bg-[#171921] border-b border-gray-100 dark:border-[#262833] flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm/50">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <Menu size={20} className={cn("transform", isRtl && "rotate-180")} />
        </button>
        <div className="hidden md:flex items-center relative">
          <Search
            size={18}
            className={cn(
              "absolute text-gray-400",
              isRtl ? "right-3" : "left-3",
            )}
          />
          <input
            type="text"
            placeholder={t("search", "Search anything...")}
            className={cn(
              "py-2 bg-gray-50 dark:bg-[#1c1e27] dark:text-gray-200 border-none rounded-full text-sm focus:ring-2 focus:ring-[#bf0d0d]/20 focus:outline-none w-64 transition-all",
              isRtl ? "pr-10 pl-4" : "pl-10 pr-4",
            )}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <LanguageSwitcher />

        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#bf0d0d] rounded-full border border-white"></span>
        </button>
        <Link
          to="/settings"
          className="flex items-center gap-3 pl-4 border-l border-gray-100 dark:border-[#262833] rtl:border-l-0 rtl:border-r rtl:pr-4 rtl:pl-0 hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden sm:block rtl:text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {adminName}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center border-2 border-white shadow-sm text-red-700 dark:text-red-400 font-bold text-sm">
            {adminInitials}
          </div>
        </Link>
      </div>
    </header>
  );
};

// Main Layout
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) return false;
    const saved = localStorage.getItem("sidebar_open");
    return saved !== null ? saved === "true" : true;
  });
  const [isMobile, setIsMobile] = useState(false);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  // Simple responsive check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        const saved = localStorage.getItem("sidebar_open");
        setSidebarOpen(saved !== null ? saved === "true" : true);
      }
    };

    // Initial check
    if (typeof window !== "undefined") {
      handleResize();
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_open", String(next));
      return next;
    });
  };

  return (
    <div
      className="flex h-screen bg-gray-50 dark:bg-[#0f1117] font-sans text-gray-900 dark:text-gray-100 overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <TopNav toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
