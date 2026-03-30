'use client';

import { useMemo } from 'react';
import { getStartOfWeek, addDays, getMonthGrid } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface ScheduleViewProps {
  mode: 'day' | 'week' | 'month';
  date: Date;
  onSlotClick?: (date: Date) => void;
  className?: string;
}

export default function ScheduleView({ mode, date, onSlotClick, className }: ScheduleViewProps) {
  const hours = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const h = i % 12 === 0 ? 12 : i % 12;
        const ampm = i < 12 ? 'am' : 'pm';
        return { label: `${h}${ampm}`, value: i };
      }),
    [],
  );

  const days = useMemo(() => {
    if (mode === 'day') {
      return [
        {
          short: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: `${date.getMonth() + 1}/${date.getDate()}`,
          fullDate: date,
        },
      ];
    }

    if (mode === 'week') {
      const weekStart = getStartOfWeek(date);
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(weekStart, i);
        return {
          short: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: `${d.getMonth() + 1}/${d.getDate()}`,
          fullDate: d,
        };
      });
    }

    return [];
  }, [mode, date]);

  const monthCells = useMemo(() => (mode === 'month' ? getMonthGrid(date) : []), [mode, date]);

  const rowCount = Math.ceil(monthCells.length / 7);

  const handleSlotClick = (dayDate: Date, hour: number, slotIndex: number) => {
    if (!onSlotClick) return;
    const clicked = new Date(dayDate);
    clicked.setHours(hour, slotIndex * 10, 0, 0);
    onSlotClick(clicked);
  };

  if (mode === 'month') {
    return (
      <div className={cn('flex flex-1 flex-col border-t border-gray-200 bg-white', className)}>
        {/* Month Header */}
        <div className="flex border-b border-gray-200 bg-white">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="flex-1 border-r border-gray-200 py-3 text-center last:border-r-0"
            >
              <span className="text-sm font-bold text-gray-900">{day}</span>
            </div>
          ))}
        </div>

        {/* Month Grid */}
        <div
          className="grid flex-1 grid-cols-7"
          style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
        >
          {monthCells.map((cell, i) => (
            <div
              key={i}
              className={cn(
                'relative flex flex-col items-end border-b border-r border-gray-200 p-2 transition-colors',
                (i + 1) % 7 === 0 && 'border-r-0',
                cell.isCurrentMonth
                  ? 'cursor-pointer hover:bg-gray-50'
                  : 'pointer-events-none bg-gray-100/60 text-gray-400',
              )}
              onClick={() => cell.isCurrentMonth && onSlotClick?.(cell.date)}
            >
              <span
                className={cn(
                  'p-1 text-xl font-semibold',
                  cell.isCurrentMonth ? 'text-gray-900' : 'text-gray-400',
                )}
              >
                {cell.date.getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-1 flex-col border-t border-gray-200 bg-white', className)}>
      {/* Room Header */}
      <div className="sticky top-0 z-20 flex h-10 items-center justify-center border-b border-gray-200 bg-gray-50/50">
        <span className="text-sm font-semibold text-gray-900">Unassigned Room</span>
      </div>

      {/* Day Headers — Week View */}
      {mode === 'week' && (
        <div className="sticky top-10 z-10 flex border-b border-gray-200 bg-white">
          <div className="w-14 flex-shrink-0 border-r border-gray-200" />
          {days.map((day) => (
            <div
              key={`${day.short}-${day.date}`}
              className="min-w-0 flex-1 border-r border-gray-200 py-2 text-center last:border-r-0"
            >
              <span className="text-sm font-bold text-gray-700">
                {day.short} {day.date}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Time Grid */}
      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour.value} className="relative min-h-[140px] border-b border-gray-200">
            {/* Time Label */}
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 flex w-14 items-start justify-center border-r border-gray-200 p-1 pt-2">
              <span className="block text-sm font-medium text-gray-600">{hour.label}</span>
            </div>

            {/* Background Grid */}
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col">
              {[0, 1, 2, 3, 4, 5].map((slot) => (
                <div
                  key={slot}
                  className="flex-1 border-b border-dashed border-gray-200 last:border-b-0"
                />
              ))}
            </div>

            {/* Interactive Columns */}
            <div className="absolute inset-0 z-10 flex pl-14">
              {days.map((day) => (
                <div
                  key={`${day.short}-${day.date}-${hour.value}`}
                  className="min-w-0 flex-1 border-r border-gray-200 last:border-r-0 flex flex-col"
                >
                  {[0, 1, 2, 3, 4, 5].map((slot) => (
                    <div
                      key={slot}
                      className="min-h-[10px] flex-1 cursor-pointer py-1 transition-colors hover:bg-gray-50/50"
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
