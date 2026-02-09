'use client';

import { useState, useRef, useEffect } from 'react';
import { Switch } from '@/components/ui';
import { ChevronDown, RotateCcw } from 'lucide-react';

export default function DisplaySettings() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-md bg-white hover:bg-gray-50 text-gray-700 whitespace-nowrap flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        Display
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Header Tabs */}
          <div className="flex border-b border-gray-100">
            <button className="flex-1 py-2 text-center text-sm font-medium text-gray-900 border-b-2 border-gray-900">
              <span className="sr-only">List View</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <button className="flex-1 py-2 text-center text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50">
              <span className="sr-only">Calendar View</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </button>
          </div>

          <div className="p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show locations</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show rooms</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Show categories</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Condensed view</span>
                <Switch />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Class options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show cancelled sessions</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show substitution requests</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Show calendar connection events</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Hide previous classes</span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-900">Reset</span>
            <RotateCcw size={14} className="text-gray-500" />
          </div>
        </div>
      )}
    </div>
  );
}
