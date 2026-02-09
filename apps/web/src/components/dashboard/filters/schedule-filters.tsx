'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import DisplaySettings from './display-settings';

export default function ScheduleFilters() {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-none px-4 pt-4">
      <button className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap">
        This Week
      </button>
      
      <div className="flex items-center border border-gray-200 rounded-md bg-white">
        <button className="p-1.5 hover:bg-gray-50 border-r border-gray-200">
          <ChevronLeft size={14} className="text-gray-500" />
        </button>
        <span className="px-3 py-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
          Monday Feb 9, 2026 - Sunday Feb 15, 2026
        </span>
        <button className="p-1.5 hover:bg-gray-50 border-l border-gray-200">
          <ChevronRight size={14} className="text-gray-500" />
        </button>
      </div>

      {['All instructors', 'All locations', 'All rooms', 'All classes', 'All categories'].map((filter) => (
        <button 
          key={filter}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap"
        >
          {filter}
        </button>
      ))}

      <div className="flex-1" />
      
      <DisplaySettings />
    </div>
  );
}
