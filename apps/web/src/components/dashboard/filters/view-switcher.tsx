'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ViewType = 'day' | 'week' | 'month';

interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { label: string; value: ViewType }[] = [
    { label: 'Day', value: 'day' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
  ];

  const handleSelect = (view: ViewType) => {
    onViewChange(view);
    setIsOpen(false);
  };

  const currentLabel = options.find(o => o.value === currentView)?.label || 'View';

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap min-w-[80px] justify-between"
      >
        {currentLabel} <ChevronDown size={12} className="ml-1 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
            >
              <div className="w-4 flex items-center justify-center">
                {currentView === option.value && <Check size={14} className="text-gray-900" />}
              </div>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
