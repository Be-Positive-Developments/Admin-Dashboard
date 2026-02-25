import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {

  DollarSign,


  Download,
  TrendingUp,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock } from
'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import {


  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area } from
'recharts';

// Mock Data
const recentDonations = [
{ id: 'DON-001', donor: 'Sarah Johnson', amount: '$50.00', date: '2023-10-15', method: 'Stripe', status: 'Completed' },
{ id: 'DON-002', donor: 'Michael Smith', amount: '$100.00', date: '2023-10-14', method: 'PayPal', status: 'Completed' },
{ id: 'DON-003', donor: 'Emily Davis', amount: '$25.00', date: '2023-10-14', method: 'Card', status: 'Processing' },
{ id: 'DON-004', donor: 'James Wilson', amount: '$250.00', date: '2023-10-13', method: 'Bank Transfer', status: 'Completed' },
{ id: 'DON-005', donor: 'Jessica Brown', amount: '$10.00', date: '2023-10-12', method: 'Stripe', status: 'Failed' },
{ id: 'DON-006', donor: 'David Miller', amount: '$75.00', date: '2023-10-11', method: 'Card', status: 'Completed' }];


const donationStats = [
{ title: 'Total Donations', value: '$12,450', change: '+12.5%', icon: DollarSign, color: 'text-green-600 bg-green-50' },
{ title: 'Avg. Donation', value: '$45.20', change: '+3.2%', icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
{ title: 'Recurring Donors', value: '142', change: '+8.7%', icon: User, color: 'text-purple-600 bg-purple-50' },
{ title: 'This Month', value: '$3,240', change: '+15.1%', icon: Calendar, color: 'text-red-600 bg-red-50' }];


const chartData = [
{ name: 'Mon', amount: 400 },
{ name: 'Tue', amount: 300 },
{ name: 'Wed', amount: 550 },
{ name: 'Thu', amount: 450 },
{ name: 'Fri', amount: 600 },
{ name: 'Sat', amount: 800 },
{ name: 'Sun', amount: 750 }];


export default function DonationsPage() {
  useDocumentTitle('Donations');
  const [filter, setFilter] = useState('All');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Donations Overview</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor donation streams and financial health.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {donationStats.map((stat, index) =>
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          
            <div className={clsx("p-3 rounded-lg flex items-center justify-center shrink-0", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-0.5">{stat.value}</h3>
              <p className="text-xs font-medium text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp size={10} /> {stat.change}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg p-2 focus:ring-red-500 focus:border-red-500 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} prefix="$" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#16a34a', fontWeight: 600 }}
                  formatter={(value) => [`$${value}`, 'Amount']} />
                
                <Area type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-96">
            {recentDonations.map((donation) =>
            <div key={donation.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                    {donation.donor.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{donation.donor}</p>
                    <p className="text-xs text-gray-500">{donation.date} • {donation.method}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{donation.amount}</p>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {donation.status === 'Completed' && <CheckCircle size={10} className="text-green-500" />}
                    {donation.status === 'Processing' && <Clock size={10} className="text-amber-500" />}
                    {donation.status === 'Failed' && <XCircle size={10} className="text-red-500" />}
                    <span className={clsx(
                    "text-[10px] font-medium uppercase tracking-wide",
                    donation.status === 'Completed' ? "text-green-600" :
                    donation.status === 'Processing' ? "text-amber-600" :
                    "text-red-600"
                  )}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-gray-600 font-medium hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-gray-300">
            View All Transactions
          </button>
        </div>
      </div>
    </div>);

}