'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthGrid, isSameDay, formatMonthYear } from '@/lib/date-utils';
import { cn } from '@/lib/utils';

interface CalendarProps {
  selected: Date;
  onSelect: (date: Date) => void;
  /** Close handler — if provided, calendar auto-closes on select and clicks outside */
  onClose?: () => void;
  className?: string;
}

export default function Calendar({ selected, onSelect, onClose, className }: CalendarProps) {
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();

  useEffect(() => {
    if (!onClose) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [onClose]);

  const cells = getMonthGrid(new Date(viewYear, viewMonth, 1));

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelect = (d: Date) => {
    onSelect(d);
    onClose?.();
  };

  return (
    <div
      ref={ref}
      className={cn(
        'w-[280px] rounded-lg border border-gray-200 bg-white p-3 shadow-lg',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">
          {formatMonthYear(new Date(viewYear, viewMonth, 1))}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={goNext}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <span key={d} className="py-1 text-xs font-medium text-gray-400">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 text-center">
        {cells.map((cell, i) => {
          const isSelected = isSameDay(cell.date, selected);
          const isToday = isSameDay(cell.date, today);

          return (
            <button
              key={i}
              onClick={() => handleSelect(cell.date)}
              className={cn(
                'mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors',
                !cell.isCurrentMonth && 'text-gray-300',
                cell.isCurrentMonth &&
                  !isSelected &&
                  !isToday &&
                  'text-gray-700 hover:bg-gray-100',
                isToday && !isSelected && 'font-semibold text-gray-900',
                isSelected && 'bg-gray-800 font-semibold text-white',
              )}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
