import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Printer,
  Share2,
  Clock,
  User,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

export default function ReportsPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  useDocumentTitle(t('reports', 'Reports'));
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock Data
  const reports = [
    {
      id: 'REP-2023-001',
      title: 'Monthly Donation Summary - October 2023',
      type: 'Financial',
      generatedBy: 'Admin User',
      date: '2023-11-01',
      status: 'Ready',
      size: '2.4 MB'
    },
    {
      id: 'REP-2023-002',
      title: 'User Activity Log - Q3 2023',
      type: 'Activity',
      generatedBy: 'System',
      date: '2023-10-15',
      status: 'Ready',
      size: '1.8 MB'
    },
    {
      id: 'REP-2023-003',
      title: 'Blood Inventory Report',
      type: 'Inventory',
      generatedBy: 'Sarah Jenkins',
      date: '2023-10-30',
      status: 'Processing',
      size: '-'
    },
    {
      id: 'REP-2023-004',
      title: 'Outstanding Cases Analysis',
      type: 'Analytics',
      generatedBy: 'Admin User',
      date: '2023-10-28',
      status: 'Failed',
      size: '-'
    },
    {
      id: 'REP-2023-005',
      title: 'New Donor Demographics',
      type: 'Demographics',
      generatedBy: 'System',
      date: '2023-10-25',
      status: 'Ready',
      size: '3.1 MB'
    },
    {
      id: 'REP-2023-006',
      title: 'Yearly Financial Audit 2022',
      type: 'Financial',
      generatedBy: 'External Audit',
      date: '2023-01-15',
      status: 'Archived',
      size: '15.6 MB'
    }
  ];

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || report.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const tabs = ['All', 'Financial', 'Activity', 'Inventory', 'Analytics'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports_center', 'Reports Center')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('reports_desc', 'Generate, view, and download system reports.')}</p>
        </div>
        <button className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          <FileText size={16} />
          {t('generate_new_report', 'Generate New Report')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab ?
                "bg-red-50 text-red-700" :
                "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
              {t(tab.toLowerCase(), tab)}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Filter className={clsx("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400", isRtl ? "right-3" : "left-3")} />
            <input
              type="text"
              placeholder={t('search_reports', 'Search reports...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={clsx(
                "w-full py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent",
                isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
              )} 
            />
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report, index) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
            <div className="flex items-start gap-4">
              <div className={clsx(
                "p-3 rounded-lg flex items-center justify-center shrink-0",
                report.type === 'Financial' ? "bg-green-50 text-green-600" :
                report.type === 'Activity' ? "bg-blue-50 text-blue-600" :
                report.type === 'Inventory' ? "bg-amber-50 text-amber-600" :
                "bg-purple-50 text-purple-600"
              )}>
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors">{report.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">{report.id}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {report.generatedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {report.date}
                  </span>
                  <span className="flex items-center gap-1">
                    {t('size', 'Size')}: {report.size}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <span className={clsx(
                "px-2.5 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1",
                report.status === 'Ready' ? "bg-green-50 text-green-700 border-green-100" :
                report.status === 'Processing' ? "bg-blue-50 text-blue-700 border-blue-100" :
                report.status === 'Archived' ? "bg-gray-50 text-gray-600 border-gray-200" :
                "bg-red-50 text-red-700 border-red-100"
              )}>
                {report.status === 'Ready' && <CheckCircle size={12} />}
                {report.status === 'Processing' && <Clock size={12} />}
                {report.status === 'Failed' && <AlertCircle size={12} />}
                {t(report.status.toLowerCase(), report.status)}
              </span>
              
              <div className={clsx("flex items-center gap-2 border-gray-100", isRtl ? "border-r pr-3" : "border-l pl-3")}>
                <button
                  disabled={report.status !== 'Ready'}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('download', 'Download')}
                >
                  <Download size={18} />
                </button>
                <button
                  disabled={report.status !== 'Ready'}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('print', 'Print')}
                >
                  <Printer size={18} />
                </button>
                <button
                  disabled={report.status !== 'Ready'}
                  className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('share', 'Share')}
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>);

}