'use client';

import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

import DisplaySettings from './display-settings';

export default function AppointmentsFilters() {
  return (
    <div className="flex items-center justify-between gap-2 mb-4 px-4 pt-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
        <button className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap">
          Today
        </button>
        
        <div className="flex items-center border border-gray-200 rounded-md bg-white">
          <button className="p-1.5 hover:bg-gray-50 border-r border-gray-200">
            <ChevronLeft size={14} className="text-gray-500" />
          </button>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-700 whitespace-nowrap">
            Monday Feb 9, 2026
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
      </div>
      
      <div className="flex items-center gap-2">
        <button className="flex items-center px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap">
          Day <ChevronDown size={12} className="ml-1" />
        </button>
        <DisplaySettings />
      </div>
    </div>
  );
}
