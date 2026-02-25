import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import {
  Plus,
  Search,

  Tag,
  MoreHorizontal,

  Clock,
  User,
  Heart } from
'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

// Mock Data
const cases = [
{
  id: 1,
  title: 'Urgent: Type O- Blood Needed',
  patient: 'Sarah Jenkins',
  hospital: 'City General Hospital',
  urgency: 'Critical',
  bloodType: 'O-',
  posted: '2 hours ago',
  status: 'Active',
  donors: 2,
  required: 5,
  tags: ['Emergency', 'Surgery']
},
{
  id: 2,
  title: 'Plasma Donation Drive',
  patient: 'Community Drive',
  hospital: 'St. Mary\'s Center',
  urgency: 'Moderate',
  bloodType: 'Any',
  posted: '1 day ago',
  status: 'Pending',
  donors: 12,
  required: 50,
  tags: ['Plasma', 'Event']
},
{
  id: 3,
  title: 'Platelets for Leukemia Patient',
  patient: 'Michael Ross',
  hospital: 'Children\'s Hospital',
  urgency: 'High',
  bloodType: 'A+',
  posted: '5 hours ago',
  status: 'Active',
  donors: 0,
  required: 3,
  tags: ['Platelets', 'Pediatric']
},
{
  id: 4,
  title: 'Rare Blood Type Needed (AB-)',
  patient: 'Unknown',
  hospital: 'University Medical',
  urgency: 'Critical',
  bloodType: 'AB-',
  posted: '30 mins ago',
  status: 'Active',
  donors: 1,
  required: 2,
  tags: ['Rare', 'Trauma']
},
{
  id: 5,
  title: 'Routine Stock Replenishment',
  patient: 'N/A',
  hospital: 'Regional Blood Bank',
  urgency: 'Low',
  bloodType: 'All',
  posted: '2 days ago',
  status: 'Approved',
  donors: 45,
  required: 100,
  tags: ['Stock', 'Routine']
},
{
  id: 6,
  title: 'B+ Donor for Transplant',
  patient: 'David Kim',
  hospital: 'Veteran\'s Hospital',
  urgency: 'High',
  bloodType: 'B+',
  posted: '4 hours ago',
  status: 'Rejected',
  donors: 0,
  required: 1,
  tags: ['Transplant']
}];


export default function CasesPage() {
  useDocumentTitle('Cases');
  const [filter, setFilter] = useState('All');

  const filteredCases = filter === 'All' ? cases : cases.filter((c) => c.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage donation requests and blood drives.</p>
        </div>
        <button className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          Create New Case
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {['All', 'Active', 'Pending', 'Approved', 'Rejected'].map((status) =>
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
              filter === status ?
              "bg-gray-900 text-white" :
              "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}>
            
              {status}
            </button>
          )}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cases..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm" />
          
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((item, index) =>
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
          
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className={clsx(
                "px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide",
                item.urgency === 'Critical' ? "bg-red-100 text-red-700" :
                item.urgency === 'High' ? "bg-orange-100 text-orange-700" :
                item.urgency === 'Moderate' ? "bg-yellow-100 text-yellow-700" :
                "bg-blue-100 text-blue-700"
              )}>
                  {item.urgency}
                </span>
                <button className="text-gray-400 hover:text-gray-900">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.hospital}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tags.map((tag) =>
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 text-xs text-gray-600 border border-gray-100">
                    <Tag size={10} />
                    {tag}
                  </span>
              )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <User size={14} className="text-gray-400" />
                  <span>Patient: <span className="font-medium text-gray-900">{item.patient}</span></span>
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <Heart size={14} className="text-red-500" />
                  <span>Blood Type: <span className="font-bold text-red-700">{item.bloodType}</span></span>
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>Posted: {item.posted}</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{item.donors} / {item.required} donors</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                  className="h-full bg-red-600 rounded-full"
                  style={{ width: `${Math.min(item.donors / item.required * 100, 100)}%` }}>
                </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl flex justify-between items-center">
              <span className={clsx(
              "text-xs font-semibold flex items-center gap-1.5",
              item.status === 'Active' ? "text-green-600" :
              item.status === 'Pending' ? "text-amber-600" :
              item.status === 'Rejected' ? "text-red-600" :
              "text-blue-600"
            )}>
                <span className={clsx(
                "h-1.5 w-1.5 rounded-full",
                item.status === 'Active' ? "bg-green-600" :
                item.status === 'Pending' ? "bg-amber-600" :
                item.status === 'Rejected' ? "bg-red-600" :
                "bg-blue-600"
              )}></span>
                {item.status}
              </span>
              <button className="text-xs font-medium text-red-700 hover:text-red-800 hover:underline">
                View Details
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>);

}