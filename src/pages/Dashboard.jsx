import React from 'react';
import {
  Users,
  Droplet,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  MoreHorizontal } from
'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend } from
'recharts';

const data = [
{ name: 'Jan', donations: 400, requests: 240 },
{ name: 'Feb', donations: 300, requests: 139 },
{ name: 'Mar', donations: 200, requests: 980 },
{ name: 'Apr', donations: 278, requests: 390 },
{ name: 'May', donations: 189, requests: 480 },
{ name: 'Jun', donations: 239, requests: 380 },
{ name: 'Jul', donations: 349, requests: 430 }];


const pieData = [
{ name: 'A+', value: 400 },
{ name: 'B+', value: 300 },
{ name: 'O+', value: 300 },
{ name: 'AB+', value: 200 },
{ name: 'Others', value: 100 }];


const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

const StatCard = ({ title, value, change, icon: Icon, trend }) =>
<div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-zinc-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
      <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{change}</span>
        <span className="text-zinc-400 font-normal ml-1">vs last month</span>
      </div>
    </div>
    <div className="p-3 bg-red-50 rounded-lg text-red-600">
      <Icon size={24} />
    </div>
  </div>;


export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Dashboard Overview</h1>
          <p className="text-zinc-500">Welcome back, Dr. Sarah Connor. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-50 transition-colors">
             Export Report
           </button>
           <button className="px-4 py-2 bg-red-700 text-white rounded-lg text-sm font-medium hover:bg-red-800 transition-colors shadow-sm shadow-red-200">
             + New Case
           </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value="12,345" change="+12%" icon={Users} trend="up" />
        <StatCard title="Active Cases" value="482" change="+8%" icon={Activity} trend="up" />
        <StatCard title="Donations" value="1,294" change="-3%" icon={Droplet} trend="down" />
        <StatCard title="Reports Generated" value="89" change="+24%" icon={FileText} trend="up" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900">Donation Trends</h3>
            <select className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-sm rounded-lg px-2 py-1">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#fef2f2' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                
                <Bar dataKey="donations" fill="#b91c1c" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="requests" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Secondary Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-zinc-100">
          <h3 className="text-lg font-bold text-zinc-900 mb-6">Blood Type Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {pieData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  )}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-zinc-900">Recent Activity</h3>
          <button className="text-red-700 text-sm font-medium hover:text-red-800">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-50 text-zinc-500 font-medium">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
              { user: 'John Doe', action: 'New Donation Request', date: '2 mins ago', status: 'Pending' },
              { user: 'Jane Smith', action: 'Blood Donation Verified', date: '1 hour ago', status: 'Completed' },
              { user: 'Mike Ross', action: 'New User Registration', date: '3 hours ago', status: 'Active' },
              { user: 'Rachel Green', action: 'Report Generated', date: '5 hours ago', status: 'Completed' }].
              map((row, idx) =>
              <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-zinc-900">{row.user}</td>
                  <td className="px-6 py-4 text-zinc-600">{row.action}</td>
                  <td className="px-6 py-4 text-zinc-500">{row.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${row.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-zinc-400 hover:text-zinc-600">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>);

}