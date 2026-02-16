'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, formatMonthYear, getMonthDays, isSameDay } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export default function DatePicker({ selectedDate, onSelect, onClose }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const handlePrevMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const days = getMonthDays(currentMonth);

  return (
    <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-gray-100 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <button 
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <span className="text-base font-medium text-gray-900">
          {formatMonthYear(currentMonth)}
        </span>
        <button 
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-4 px-2">
        {['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-1 px-2">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;
          
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => {
                onSelect(day);
                onClose();
              }}
              className={cn(
                "h-9 w-9 flex items-center justify-center text-sm transition-colors mx-auto rounded-[3px]",
                isSelected 
                  ? "bg-gray-900 text-white font-medium" 
                  : "text-gray-700 hover:bg-gray-100 font-normal"
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
