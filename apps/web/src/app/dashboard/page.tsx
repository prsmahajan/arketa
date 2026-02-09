'use client';

import { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  ArrowRight, 
  MoreHorizontal,
  PieChart,
  Download,
  Star,
  Search,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('All');
  
  const tabs = [
    { label: 'All', count: 0 },
    { label: 'Failed Subscriptions', count: 0 },
    { label: 'Class Packs Low', count: 0 },
    { label: 'Class Packs Expiring', count: 0 },
    { label: 'Tasks Assigned', count: 0 },
  ];

  return (
    <div className="space-y-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Home</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
          <MoreHorizontal size={16} /> Customize Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Notification Center */}
        <div className="xl:col-span-2">
          <Card className="h-full border border-gray-200 shadow-sm bg-white overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-5 border-b border-gray-100 flex items-center gap-3">
              <Bell size={20} className="text-gray-500" />
              <h2 className="font-bold text-gray-900">Notification Center</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center px-2 pt-2 border-b border-gray-100 overflow-x-auto scrollbar-thin">
              {tabs.map((tab) => (
                <button 
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2",
                    activeTab === tab.label 
                      ? "border-gray-900 text-gray-900" 
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                  )}
                >
                  {tab.label}
                  <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] border border-gray-200 min-w-[20px] text-center">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 text-sm">
              No to review
            </div>
          </Card>
        </div>

        {/* Upcoming Schedule */}
        <div>
          <Card className="h-full border border-gray-200 shadow-sm bg-white overflow-hidden flex flex-col min-h-[300px]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-500" />
                <h2 className="font-bold text-gray-900">Upcoming Schedule</h2>
              </div>
              <button className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1 border border-gray-200 rounded px-2 py-1 transition-colors">
                Go to schedule <ArrowRight size={12} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400 text-sm">
              No upcoming or in-progress classes
            </div>
          </Card>
        </div>
      </div>

      {/* Favorite Reports */}
      <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PieChart size={20} className="text-gray-500" />
            <h2 className="font-bold text-gray-900">Favorite Reports</h2>
          </div>
          <button className="text-xs font-medium text-gray-500 hover:text-black flex items-center gap-1 border border-gray-200 rounded px-2 py-1 transition-colors">
            Go to favorites <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Total Sales */}
          <div className="p-6 h-[200px] flex flex-col border-b border-gray-100 md:border-r">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Sales</span>
                <HelpCircle size={14} className="text-gray-300" />
              </div>
              <Star size={16} className="text-gray-300 hover:text-yellow-400 cursor-pointer" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">$0.00</h3>
          </div>

          {/* Active Subscriptions */}
          <div className="p-6 h-[200px] flex flex-col border-b border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Subscriptions (All Time)</span>
              <Star size={16} className="text-gray-300 hover:text-yellow-400 cursor-pointer" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">0</h3>
          </div>

          {/* Sales by Category */}
          <div className="p-6 h-[200px] flex flex-col md:border-r border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sales by Category</span>
                <HelpCircle size={14} className="text-gray-300" />
              </div>
              <div className="flex gap-2">
                <Star size={16} className="text-gray-300 hover:text-yellow-400 cursor-pointer" />
                <Download size={16} className="text-gray-300 hover:text-black cursor-pointer" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm gap-2">
              <Search size={16} /> No data
            </div>
          </div>

          {/* Sales Over Time */}
          <div className="p-6 h-[200px] flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sales Over Time</span>
              <div className="flex gap-2">
                <Star size={16} className="text-gray-300 hover:text-yellow-400 cursor-pointer" />
                <Download size={16} className="text-gray-300 hover:text-black cursor-pointer" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">$0.00</h3>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm gap-2">
              <Search size={16} /> No data
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
