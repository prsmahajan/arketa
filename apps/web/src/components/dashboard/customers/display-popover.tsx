'use client';

import { useState, useCallback } from 'react';
import { GripHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DISPLAY_COLUMNS,
  DEFAULT_VISIBLE_COLUMNS,
  DEFAULT_ITEMS_PER_PAGE,
  ITEMS_PER_PAGE_OPTIONS,
} from './clients-data';
import type { DisplaySettings } from './clients-data';
import { useClickOutside } from './use-click-outside';

type DisplayPopoverProps = {
  settings: DisplaySettings;
  onSettingsChange: (settings: DisplaySettings) => void;
};

export function DisplayPopover({ settings, onSettingsChange }: DisplayPopoverProps) {
  const [open, setOpen] = useState(false);
  const [itemsDropdownOpen, setItemsDropdownOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setItemsDropdownOpen(false);
  }, []);
  const ref = useClickOutside<HTMLDivElement>(open, close);

  const closeItemsDropdown = useCallback(() => setItemsDropdownOpen(false), []);
  const itemsRef = useClickOutside<HTMLDivElement>(itemsDropdownOpen, closeItemsDropdown);

  const toggleColumn = (key: string) => {
    const next = new Set(settings.visibleColumns);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onSettingsChange({ ...settings, visibleColumns: next });
  };

  const toggleCondensed = () => {
    onSettingsChange({ ...settings, condensed: !settings.condensed });
  };

  const setItemsPerPage = (value: number) => {
    onSettingsChange({ ...settings, itemsPerPage: value });
    setItemsDropdownOpen(false);
  };

  const handleReset = () => {
    onSettingsChange({
      visibleColumns: new Set(DEFAULT_VISIBLE_COLUMNS),
      condensed: false,
      itemsPerPage: DEFAULT_ITEMS_PER_PAGE,
    });
    setItemsDropdownOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="h-8 rounded border border-gray-300 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Display
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-[340px] rounded-lg border border-gray-200 bg-white shadow-lg">
          {/* Column toggles */}
          <div className="max-h-[500px] overflow-y-auto py-2">
            {DISPLAY_COLUMNS.map((col) => {
              const isOn = settings.visibleColumns.has(col.key);
              return (
                <div
                  key={col.key}
                  className="flex items-center justify-between px-4 py-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    <GripHorizontal size={14} className="text-gray-300" />
                    <span className="text-sm text-gray-700">{col.label}</span>
                  </div>
                  <button
                    onClick={() => toggleColumn(col.key)}
                    className={cn(
                      'relative h-5 w-9 rounded-full transition-colors',
                      isOn ? 'bg-gray-900' : 'bg-gray-200',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                        isOn ? 'left-[18px]' : 'left-0.5',
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Separator */}
          <div className="border-t border-gray-100" />

          {/* Condensed view */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-700">Condensed view</span>
            <button
              onClick={toggleCondensed}
              className={cn(
                'relative h-5 w-9 rounded-full transition-colors',
                settings.condensed ? 'bg-gray-900' : 'bg-gray-200',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                  settings.condensed ? 'left-[18px]' : 'left-0.5',
                )}
              />
            </button>
          </div>

          {/* Items per page */}
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-sm text-gray-700">Items per page</span>
            <div ref={itemsRef} className="relative">
              <button
                onClick={() => setItemsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-0.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {settings.itemsPerPage}
                <ChevronDown size={12} className="text-gray-400" />
              </button>
              {itemsDropdownOpen && (
                <div className="absolute right-0 top-8 z-10 min-w-[80px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => setItemsPerPage(option)}
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50',
                        option === settings.itemsPerPage
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-600',
                      )}
                    >
                      {option === settings.itemsPerPage && (
                        <span className="text-gray-900">&#10003;</span>
                      )}
                      {option !== settings.itemsPerPage && <span className="w-4" />}
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reset */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100">
            <span className="text-sm text-gray-700">Reset</span>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
