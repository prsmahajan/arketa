'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { getStartOfWeek, addDays, addWeeks, formatDate, formatMonthYear } from '@/lib/date-utils';
import DatePicker from './date-picker';
import DisplaySettings from './display-settings';

import ViewSwitcher, { ViewType } from './view-switcher';

interface ScheduleFiltersProps {
  view: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function ScheduleFilters({ view, onViewChange }: ScheduleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Get date from URL or default to today
  const dateParam = searchParams.get('date');
  const getCurrentDate = () => {
    if (dateParam) {
      const [y, m, d] = dateParam.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const currentDate = getCurrentDate();
  const weekStart = getStartOfWeek(currentDate);
  const weekEnd = addDays(weekStart, 6);

  const getStartOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const getEndOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date: Date, months: number) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const updateDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateString = `${y}-${m}-${d}`;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('date', dateString);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePrev = () => {
    if (view === 'day') updateDate(addDays(currentDate, -1));
    else if (view === 'week') updateDate(addWeeks(currentDate, -1));
    else if (view === 'month') updateDate(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (view === 'day') updateDate(addDays(currentDate, 1));
    else if (view === 'week') updateDate(addWeeks(currentDate, 1));
    else if (view === 'month') updateDate(addMonths(currentDate, 1));
  };

  const handleToday = () => updateDate(new Date());

  const togglePicker = () => {
    if (!isDatePickerOpen && datePickerRef.current) {
      const rect = datePickerRef.current.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + 8, left: rect.left });
    }
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  // Close date picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRangeText = () => {
    if (view === 'day') return formatDate(currentDate);
    if (view === 'week') return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    if (view === 'month') {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      return `${formatDate(startOfMonth)} - ${formatDate(endOfMonth)}`;
    }
    return '';
  };

  const getButtonText = () => {
    if (view === 'day') return 'Today';
    if (view === 'week') return 'This Week';
    if (view === 'month') return 'This Month';
    return 'Today';
  };
  
  return (
    <div className="flex items-center justify-between gap-2 mb-4 px-4 pt-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin flex-1">
        <button 
          onClick={handleToday}
          className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap"
        >
          {getButtonText()}
        </button>
        
        <div className="relative z-50" ref={datePickerRef}>
          <div className="flex items-center border border-gray-200 rounded-md bg-white">
            <button 
              onClick={handlePrev}
              className="p-1.5 hover:bg-gray-50 border-r border-gray-200 text-gray-500"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={togglePicker}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50 transition-colors"
            >
              {getRangeText()}
            </button>
            <button 
              onClick={handleNext}
              className="p-1.5 hover:bg-gray-50 border-l border-gray-200 text-gray-500"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {isDatePickerOpen && (
            <div 
              className="fixed z-[60]"
              style={{ top: pickerPos.top, left: pickerPos.left }}
            >
              <DatePicker 
                selectedDate={currentDate}
                onSelect={(date) => {
                  updateDate(date);
                  setIsDatePickerOpen(false);
                }}
                onClose={() => setIsDatePickerOpen(false)}
              />
            </div>
          )}
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
      
      <div className="flex items-center gap-2 flex-shrink-0 pb-2 z-50">
        <ViewSwitcher currentView={view} onViewChange={onViewChange} />
        <DisplaySettings />
      </div>
    </div>
  );
}
