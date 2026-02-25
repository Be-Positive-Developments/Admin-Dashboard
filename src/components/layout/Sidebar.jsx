import React from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
  BriefcaseMedical } from
'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import logo from '@/assets/images/be-postive-logo.png';






export function Sidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Users', path: '/users' },
  { icon: BriefcaseMedical, label: 'Cases', path: '/cases' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: Heart, label: 'Donations', path: '/donations' },
  { icon: BarChart2, label: 'Analytics', path: '/analytics' },
  { icon: Settings, label: 'Settings', path: '/settings' }];


  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
      className="h-screen bg-white border-r border-gray-200 sticky top-0 flex flex-col shadow-sm z-20 transition-all duration-300 ease-in-out">
      
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 p-4 overflow-hidden relative">
        <div className="flex items-center gap-3 w-full">
           <img src={logo} alt="Be Positive Logo" className="h-8 w-8 object-contain shrink-0" />
           <motion.span
            animate={{ opacity: isOpen ? 1 : 0, display: isOpen ? "block" : "none" }}
            className="font-bold text-gray-900 text-lg whitespace-nowrap overflow-hidden">
            
             Be Positive
           </motion.span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) =>
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => clsx(
            "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors relative group",
            isActive ?
            "bg-red-50 text-red-700" :
            "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          )}>
          
            <item.icon className={clsx("h-5 w-5 shrink-0", isOpen ? "" : "mx-auto")} />
            <motion.span
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
            className="font-medium whitespace-nowrap overflow-hidden">
            
              {item.label}
            </motion.span>
            
            {/* Tooltip for collapsed state */}
            {!isOpen &&
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
          }
          </NavLink>
        )}
      </nav>

      {/* Footer / Toggle */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors">
          
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
        
        <div className={clsx("mt-4 flex items-center gap-3 px-2", isOpen ? "" : "justify-center")}>
           <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold shrink-0">
             AD
           </div>
           {isOpen &&
          <div className="overflow-hidden">
               <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
               <p className="text-xs text-gray-500 truncate">admin@bepositive.org</p>
             </div>
          }
        </div>
        
        <button
          onClick={() => navigate('/login')}
          className={clsx(
            "mt-4 w-full flex items-center gap-3 px-2 py-2 text-gray-500 hover:text-red-600 transition-colors",
            isOpen ? "" : "justify-center"
          )}>
          <LogOut size={20} />
          {isOpen && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </motion.aside>);

}