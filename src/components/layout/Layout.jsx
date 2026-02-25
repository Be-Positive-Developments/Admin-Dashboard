import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Users,
  FileText,
  Heart,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  BriefcaseMedical } from
'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Logo Asset
import logo from '@/assets/images/be-postive-logo.png';

const cn = (...inputs) => twMerge(clsx(inputs));

const SidebarItem = ({
  to,
  icon: Icon,
  label,
  collapsed,
  onClick






}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative",
        isActive ?
        "bg-red-50 text-red-700 font-medium shadow-sm" :
        "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
        collapsed ? "justify-center" : ""
      )}>
      
      <Icon className={cn("w-5 h-5 min-w-[20px]", collapsed ? "mx-auto" : "")} />
      {!collapsed &&
      <span className="whitespace-nowrap overflow-hidden text-sm">
          {label}
        </span>
      }
      {collapsed &&
      <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
          {label}
        </div>
      }
    </NavLink>);

};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const sidebarItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/users", icon: Users, label: "Users Management" },
  { to: "/cases", icon: BriefcaseMedical, label: "Cases Management" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/donations", icon: Heart, label: "Donations" },
  { to: "/analytics", icon: BarChart2, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" }];


  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" />

        }
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-zinc-200 shadow-lg lg:shadow-none transition-all duration-300",
          collapsed ? "w-20" : "w-64",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
        
        {/* Logo Section */}
        <div className={cn("flex items-center h-16 px-4 border-b border-zinc-100", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed ?
          <div className="flex items-center gap-2">
              <img src={logo} alt="Be Positive Logo" className="h-8 w-auto object-contain" />
            </div> :

          <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
          }
          <button onClick={toggleSidebar} className="hidden lg:flex p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500">
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5 text-zinc-500">
             <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
          {sidebarItems.map((item) =>
          <SidebarItem
            key={item.to}
            {...item}
            collapsed={collapsed}
            onClick={() => setMobileMenuOpen(false)} />

          )}
        </div>

        {/* User Profile / Logout */}
        <div className="p-3 border-t border-zinc-100">
          <button className={cn(
            "flex items-center gap-3 w-full p-2 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors",
            collapsed ? "justify-center" : ""
          )}>
            <LogOut size={20} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 lg:px-8 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="lg:hidden p-2 hover:bg-zinc-100 rounded-md text-zinc-600">
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-full w-64 border border-zinc-200 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-300 transition-all">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-full text-zinc-700 placeholder:text-zinc-400" />
              
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-zinc-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-zinc-900">Dr. Sarah Connor</p>
                <p className="text-xs text-zinc-500">Admin</p>
              </div>
              <div className="w-9 h-9 bg-zinc-200 rounded-full flex items-center justify-center overflow-hidden border border-zinc-300">
                 <User className="text-zinc-400" size={20} />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>);

}