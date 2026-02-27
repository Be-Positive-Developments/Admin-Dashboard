import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router';
import { useTranslation } from 'react-i18next';
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
  BriefcaseMedical } from
'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import logo from '@/assets/images/be-postive-logo.png';
import { LanguageSwitcher } from './LanguageSwitcher';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const navItems = [
    { name: t('dashboard', 'Dashboard'), icon: LayoutDashboard, path: '/' },
    { name: t('users', 'Users'), icon: Users, path: '/users' },
    { name: t('cases', 'Cases'), icon: BriefcaseMedical, path: '/cases' },
    { name: t('reports', 'Reports'), icon: FileText, path: '/reports' },
    { name: t('donations', 'Donations'), icon: Heart, path: '/donations' },
    { name: t('analytics', 'Analytics'), icon: PieChart, path: '/analytics' },
    { name: t('settings', 'Settings'), icon: Settings, path: '/settings' }
  ];


  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? 256 : isMobile ? 0 : 80,
        x: isMobile && !isOpen ? (isRtl ? 256 : -256) : 0
      }}
      className={cn(
        "fixed start-0 top-0 z-40 h-screen bg-white shadow-xl overflow-hidden border-e border-gray-100 flex flex-col transition-all",
        isMobile ? "absolute" : "relative"
      )}>
      
      <div className="flex items-center h-16 px-6 border-b border-gray-100 justify-between">
        <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
           {/* Logo Icon */}
          <div className="min-w-8 min-h-8 flex items-center justify-center">
            <img src={logo} alt="Be Positive Logo" className="h-8 w-8 object-contain" />
          </div>
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? "block" : "none" }}
            className="font-bold text-xl text-gray-900 tracking-tight">
            
            Be <span className="text-[#bf0d0d]">Positive</span>
          </motion.span>
        </div>
        {!isMobile && isOpen &&
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <ChevronLeft size={20} className={cn("transform transition-transform", isRtl && "rotate-180")} />
          </button>
        }
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
                isActive ?
                "bg-[#bf0d0d]/10 text-[#bf0d0d]" :
                "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}>
              
              {isActive &&
              <motion.div
                layoutId="activeTab"
                className="absolute start-0 top-0 bottom-0 w-1 bg-[#bf0d0d] rounded-e-full" />

              }
              <item.icon size={22} className={cn("flex-shrink-0", isActive && "text-[#bf0d0d]")} />
              <motion.span
                animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? "block" : "none" }}
                className="font-medium whitespace-nowrap">
                
                {item.name}
              </motion.span>
              
              {!isOpen && !isMobile &&
              <div className={cn(
                "absolute bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap z-[100]",
                isRtl ? "right-16" : "left-16"
              )}>
                  {item.name}
                </div>
              }
            </Link>);

        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <button className={cn(
          "flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-colors text-red-600 hover:bg-red-50",
          !isOpen && "justify-center"
        )}>
          <LogOut size={22} className="flex-shrink-0" />
          <motion.span
            animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? "block" : "none" }}
            className="font-medium whitespace-nowrap">
            
            {t('logout', 'Logout')}
          </motion.span>
        </button>
      </div>
    </motion.aside>);

};

// Top Navigation
const TopNav = ({ toggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm/50">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
          <Menu size={20} className={cn("transform", isRtl && "rotate-180")} />
        </button>
        <div className="hidden md:flex items-center relative">
          <Search size={18} className={cn("absolute text-gray-400", isRtl ? "right-3" : "left-3")} />
          <input
            type="text"
            placeholder={t('search', "Search anything...")}
            className={cn(
              "py-2 bg-gray-50 border-none rounded-full text-sm focus:ring-2 focus:ring-[#bf0d0d]/20 focus:outline-none w-64 transition-all",
              isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
            )} />
          
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#bf0d0d] rounded-full border border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100 rtl:border-l-0 rtl:border-r rtl:pr-4 rtl:pl-0">
          <div className="text-right hidden sm:block rtl:text-left">
            <p className="text-sm font-semibold text-gray-900">Dr. Sarah Jenkins</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
             <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=128&q=80" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>);

};

// Main Layout
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  // Simple responsive check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setSidebarOpen(false);
      } else {
        setIsMobile(false);
        setSidebarOpen(true);
      }
    };

    // Initial check
    if (typeof window !== 'undefined') {
      handleResize();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} isMobile={isMobile} />
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        <TopNav toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
             <Outlet />
          </div>
        </main>
      </div>
      
      {isMobile && sidebarOpen &&
      <div
        className="fixed inset-0 bg-black/50 z-30"
        onClick={() => setSidebarOpen(false)} />

      }
    </div>);

}