import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  Users,
  Activity,
  FileText,
  DollarSign,

  ArrowUpRight,
  ArrowDownRight } from
'lucide-react';
import {


  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area } from
'recharts';
import { motion } from 'motion/react';

// Mock Data
const stats = [
{
  title: 'Total Users',
  value: '2,453',
  change: '+12.5%',
  trend: 'up',
  icon: Users,
  color: 'bg-blue-50 text-blue-600'
},
{
  title: 'Active Cases',
  value: '45',
  change: '-2.4%',
  trend: 'down',
  icon: Activity,
  color: 'bg-red-50 text-red-600'
},
{
  title: 'New Reports',
  value: '12',
  change: '+5.2%',
  trend: 'up',
  icon: FileText,
  color: 'bg-amber-50 text-amber-600'
},
{
  title: 'Total Donations',
  value: '$14,250',
  change: '+18.2%',
  trend: 'up',
  icon: DollarSign,
  color: 'bg-emerald-50 text-emerald-600'
}];


const data = [
{ name: 'Jan', cases: 40, donations: 2400 },
{ name: 'Feb', cases: 30, donations: 1398 },
{ name: 'Mar', cases: 20, donations: 9800 },
{ name: 'Apr', cases: 27, donations: 3908 },
{ name: 'May', cases: 18, donations: 4800 },
{ name: 'Jun', cases: 23, donations: 3800 },
{ name: 'Jul', cases: 34, donations: 4300 }];


const recentActivity = [
{ id: 1, user: 'Sarah Connor', action: 'New donation received', time: '2 mins ago', amount: '+$50.00' },
{ id: 2, user: 'John Doe', action: 'Case #452 status updated', time: '1 hour ago', status: 'Approved' },
{ id: 3, user: 'Emily White', action: 'New user registration', time: '3 hours ago', role: 'Donor' },
{ id: 4, user: 'Michael Brown', action: 'Report flagged for review', time: '5 hours ago', priority: 'High' },
{ id: 5, user: 'Jessica Smith', action: 'Recurring donation setup', time: '1 day ago', amount: '+$25.00/mo' }];


export default function DashboardHome() {
  useDocumentTitle('Dashboard');
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) =>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Donation & Case Trends</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1f2937' }} />
                
                <Area type="monotone" dataKey="donations" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDonations)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {recentActivity.map((activity, index) =>
            <div key={activity.id} className="flex items-start gap-4">
                <div className="h-2 w-2 mt-2 rounded-full bg-red-500 shrink-0 ring-4 ring-red-50"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{activity.time}</span>
                    {activity.amount && <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">{activity.amount}</span>}
                    {activity.status && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{activity.status}</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-red-700 font-medium hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
            View All Activity
          </button>
        </div>
      </div>
    </div>);

}