'use client';

import { useMemo } from 'react';
import { getStartOfWeek, addDays, getMonthDays } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface ScheduleViewProps {
  mode: 'day' | 'week' | 'month';
  date: Date;
  onSlotClick?: (date: Date) => void;
  className?: string;
}

export default function ScheduleView({ 
  mode, 
  date, 
  onSlotClick,
  className 
}: ScheduleViewProps) {
  // Generate 24 hours: 12am, 1am, ..., 11pm
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? 'am' : 'pm';
    return { label: `${h}${ampm}`, value: i };
  }), []);

  // Calculate days based on mode
  const days = useMemo(() => {
    if (mode === 'day') {
      return [{
        short: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: date
      }];
    }
    
    if (mode === 'week') {
      const weekStart = getStartOfWeek(date);
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i);
        return {
          short: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          fullDate: d
        };
      });
    }

    return []; // Month view handled separately
  }, [mode, date]);

  const monthDays = useMemo(() => {
    if (mode === 'month') {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
      
      // Previous month days
      const startDay = firstDay.getDay(); // 0 is Sunday
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      
      for (let i = startDay - 1; i >= 0; i--) {
        calendarDays.push({
            date: new Date(year, month - 1, prevMonthLastDay - i),
            isCurrentMonth: false
        });
      }
      
      // Current month days
      for (let i = 1; i <= lastDay.getDate(); i++) {
        calendarDays.push({
            date: new Date(year, month, i),
            isCurrentMonth: true
        });
      }
      
      // Next month days to fill grid (either 35 or 42 cells usually)
      // Ensure we have at least 5 rows (35 days) or 6 rows (42 days)
      const remaining = 7 - (calendarDays.length % 7);
      if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
             calendarDays.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }
      }
      
      // If we have less than 35 days (5 rows), add another week
      while (calendarDays.length < 35) {
         const lastDate = calendarDays[calendarDays.length - 1].date;
         const nextDate = new Date(lastDate);
         nextDate.setDate(lastDate.getDate() + 1);
         calendarDays.push({
             date: nextDate,
             isCurrentMonth: false
         });
      }

      return calendarDays;
    }
    return [];
  }, [mode, date]);

  const rowCount = Math.ceil(monthDays.length / 7);

  const handleSlotClick = (dayDate: Date, hour: number, slotIndex: number) => {
    if (!onSlotClick) return;
    
    const clickedDate = new Date(dayDate);
    clickedDate.setHours(hour, slotIndex * 10, 0, 0);
    onSlotClick(clickedDate);
  };

  if (mode === 'month') {
    return (
      <div className={cn("flex flex-col flex-1 bg-white border-t border-gray-200", className)}>
        {/* Month Header */}
        <div className="flex border-b border-gray-200 bg-white">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="flex-1 py-3 text-center border-r border-gray-200 last:border-r-0">
              <span className="text-sm font-bold text-gray-900">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Month Grid */}
        <div 
          className="flex-1 grid grid-cols-7"
          style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
        >
          {monthDays.map((dayObj, i) => (
            <div 
              key={i} 
              className={cn(
                "border-b border-r border-gray-200 p-2 relative transition-colors flex flex-col items-end",
                (i + 1) % 7 === 0 && "border-r-0",
                dayObj.isCurrentMonth ? "hover:bg-gray-50 cursor-pointer" : "bg-gray-100/60 text-gray-400 pointer-events-none"
              )}
              onClick={() => dayObj.isCurrentMonth && onSlotClick?.(dayObj.date)}
            >
                <span className={cn("text-xl font-semibold p-1", dayObj.isCurrentMonth ? "text-gray-900" : "text-gray-400")}>
                  {dayObj.date.getDate()}
                </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col flex-1 bg-white border-t border-gray-200", className)}>
      {/* Room Header - Common to both */}
      <div className="h-10 border-b border-gray-200 flex items-center justify-center bg-gray-50/50 sticky top-0 z-20">
        <span className="text-sm font-semibold text-gray-900">Unassigned Room</span>
      </div>

      {/* Day Headers - Only for Week View */}
      {mode === 'week' && (
        <div className="flex border-b border-gray-200 sticky top-10 z-10 bg-white">
          <div className="w-14 flex-shrink-0 border-r border-gray-200" />
          {days.map((day) => (
            <div
              key={`${day.short}-${day.date}`}
              className="flex-1 min-w-0 border-r border-gray-200 last:border-r-0 py-2 text-center"
            >
              <span className="text-sm font-bold text-gray-700">
                {day.short} {day.date}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {hours.map((hour) => (
          <div key={hour.value} className="relative min-h-[140px] border-b border-gray-200">
            {/* Time Label */}
            <div className="absolute left-0 top-0 bottom-0 w-14 border-r border-gray-200 p-1 text-center z-20 pointer-events-none flex items-start justify-center pt-2">
              <span className="text-sm font-bold text-gray-600 font-medium block">{hour.label}</span>
            </div>

            {/* Horizontal Lines - Background Grid */}
            <div className="absolute inset-0 flex flex-col z-0 pointer-events-none">
              {[0, 1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className="flex-1 border-b border-gray-200 border-dashed last:border-b-0"
                />
              ))}
            </div>

            {/* Day Columns - Foreground Interactive Area */}
            <div className="absolute inset-0 pl-14 flex z-10">
              {days.map((day) => (
                <div
                  key={`${day.short}-${day.date}-${hour.value}`}
                  className="flex-1 min-w-0 border-r border-gray-200 last:border-r-0 flex flex-col"
                >
                  {[0, 1, 2, 3, 4, 5].map((slot) => (
                    <div
                      key={slot}
                      className="flex-1 min-h-[10px] py-1 hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleSlotClick(day.fullDate, hour.value, slot)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
