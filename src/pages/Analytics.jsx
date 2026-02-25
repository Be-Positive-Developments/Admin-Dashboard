import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
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
  Cell } from
'recharts';
import { ArrowUp, ArrowDown, Download } from 'lucide-react';

const data = [
{ name: 'Mon', donations: 4000, newUsers: 2400 },
{ name: 'Tue', donations: 3000, newUsers: 1398 },
{ name: 'Wed', donations: 2000, newUsers: 9800 },
{ name: 'Thu', donations: 2780, newUsers: 3908 },
{ name: 'Fri', donations: 1890, newUsers: 4800 },
{ name: 'Sat', donations: 2390, newUsers: 3800 },
{ name: 'Sun', donations: 3490, newUsers: 4300 }];


const bloodTypeData = [
{ name: 'A+', value: 400 },
{ name: 'O+', value: 300 },
{ name: 'B+', value: 300 },
{ name: 'AB+', value: 200 },
{ name: 'A-', value: 100 },
{ name: 'O-', value: 100 },
{ name: 'B-', value: 50 },
{ name: 'AB-', value: 50 }];


const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1'];

export default function AnalyticsPage() {
  useDocumentTitle('Analytics');
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Deep dive into your donation metrics and user growth.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Download size={16} />
          Export Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Donations (Year)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">$124,500</span>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
              <ArrowUp size={12} className="mr-0.5" /> 12.5%
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">New Donors (Month)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">1,240</span>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center">
              <ArrowUp size={12} className="mr-0.5" /> 8.2%
            </span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Case Resolution Rate</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">94.2%</span>
            <span className="text-xs font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center">
              <ArrowDown size={12} className="mr-0.5" /> 1.5%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">User Growth vs Donations</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                
                <Legend />
                <Line type="monotone" dataKey="donations" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Blood Type Distribution</h3>
          <div className="h-80 w-full">
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
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  
                  {bloodTypeData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>);

}