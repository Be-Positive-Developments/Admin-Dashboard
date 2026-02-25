import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  User,
  Bell,
  Shield,
  Globe,




  Save,
  Mail,
  Lock } from
'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { toast } from 'sonner';

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    weekly: true
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const tabs = [
  { id: 'profile', label: 'Profile Settings', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
  { id: 'system', label: 'System Preferences', icon: Globe }];


  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences and system configuration.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-100 p-2 md:p-4 space-y-1">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
              activeTab === tab.id ?
              "bg-white text-red-700 shadow-sm ring-1 ring-gray-100" :
              "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}>
            
              <tab.icon size={18} />
              {tab.label}
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'profile' &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-2xl font-bold">
                  AD
                </div>
                <div>
                  <button className="text-sm font-medium text-red-700 hover:text-red-800 hover:underline">Change Avatar</button>
                  <p className="text-xs text-gray-500 mt-1">Recommended size: 256x256px</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                    defaultValue="Admin"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
                  
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                    defaultValue="User"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
                  
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                    defaultValue="admin@bepositive.org"
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none" />
                  
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                    defaultValue="Super Administrator"
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed" />
                  
                  </div>
                </div>
              </div>
            </motion.div>
          }

          {activeTab === 'notifications' &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">New User Registrations</p>
                    <p className="text-xs text-gray-500">Receive an email when a new user signs up.</p>
                  </div>
                  <button
                  onClick={() => toggleNotification('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.email ? 'bg-red-600' : 'bg-gray-200'}`}>
                  
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Urgent Case Alerts</p>
                    <p className="text-xs text-gray-500">Get notified immediately for critical cases.</p>
                  </div>
                  <button
                  onClick={() => toggleNotification('push')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.push ? 'bg-red-600' : 'bg-gray-200'}`}>
                  
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Weekly Reports</p>
                    <p className="text-xs text-gray-500">Receive a weekly summary of donations and activity.</p>
                  </div>
                  <button
                  onClick={() => toggleNotification('weekly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications.weekly ? 'bg-red-600' : 'bg-gray-200'}`}>
                  
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications.weekly ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          }

          {/* Placeholder for other tabs */}
          {(activeTab === 'security' || activeTab === 'system') &&
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 text-gray-400">
               <Lock className="h-12 w-12 mb-2 opacity-20" />
               <p>Settings for this section are restricted or coming soon.</p>
             </motion.div>
          }

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => toast.success('Settings saved successfully')}
              className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>);

}