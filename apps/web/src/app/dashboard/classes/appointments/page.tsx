'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Modal, Select, Input } from '@/components/ui';

import ClassesHeader from '@/components/dashboard/classes-header';
import AppointmentsFilters from '@/components/dashboard/filters/appointments-filters';

export default function AppointmentsListPage() {
  const [modalState, setModalState] = useState<{ isOpen: boolean; time: string }>({
    isOpen: false,
    time: ''
  });

  // Generate 24 hours: 12am, 1am, ..., 11pm
  const hours = Array.from({ length: 24 }, (_, i) => {
    const h = i % 12 === 0 ? 12 : i % 12;
    const ampm = i < 12 ? 'am' : 'pm';
    return { label: `${h}${ampm}`, value: i };
  });

  const handleSlotClick = (hour: number, slotIndex: number) => {
    // slotIndex 0-5 (00, 10, 20, 30, 40, 50)
    const minute = slotIndex * 10;
    const h = hour % 12 === 0 ? 12 : hour % 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const timeString = `${h}:${minute.toString().padStart(2, '0')}`;
    
    setModalState({
      isOpen: true,
      time: timeString // Store basic time string, ideally use Date object
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Tabs */}
      <ClassesHeader />

      {/* Filters Bar */}
      <AppointmentsFilters />

      {/* Calendar View */}
      <div className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-10 border-b border-gray-100 flex items-center justify-center bg-gray-50/50 sticky top-0 z-10">
          <span className="text-sm font-semibold text-gray-900">Unassigned Room</span>
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour.value} className="relative min-h-[120px] border-b border-[#bbb]">
              {/* Time Label */}
              <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-gray-100 p-1 text-center z-10 pointer-events-none">
                <span className="text-xs text-[#333] font-medium block">{hour.label}</span>
              </div>
              
              {/* Content Area - Spans full width behind label */}
              <div className="absolute inset-0 flex flex-col z-0">
                {[0, 1, 2, 3, 4, 5].map((slot) => (
                  <div 
                    key={slot} 
                    className="flex-1 border-b border-gray-200 border-dashed p-2 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleSlotClick(hour.value, slot)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        title="Add Appointment"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <Select label="Room">
              <option>Unassigned room</option>
              <option>Room A</option>
              <option>Room B</option>
            </Select>

            <Select label="Instructor">
              <option>Select an instructor</option>
              <option>Sarah Johnson</option>
              <option>Mike Chen</option>
            </Select>

            {/* Custom Calendar UI Mockup */}
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">February</span>
                  <span className="text-sm font-medium text-gray-500">2026</span>
                </div>
                <div className="flex gap-1">
                  <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={14} /></button>
                  <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={14} /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <span key={d} className="text-[10px] text-gray-400 font-medium">{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Simplified calendar logic for Feb 2026 (starts on Sunday) */}
                {Array.from({ length: 28 }, (_, i) => i + 1).map(d => (
                  <button 
                    key={d} 
                    className={cn(
                      "w-7 h-7 flex items-center justify-center text-xs rounded hover:bg-gray-50 transition-colors",
                      d === 9 ? "bg-[#337EA9] text-white hover:bg-[#337EA9]" : "text-gray-700"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center font-semibold text-gray-900">
              Monday February 9, 2026
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Start time</label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden h-11">
                  <div className="flex items-center px-3 border-r border-gray-200 bg-gray-50 text-gray-500">
                    <Clock size={16} />
                  </div>
                  <input 
                    type="text" 
                    className="flex-1 px-3 text-sm focus:outline-none"
                    value={modalState.time.split(':')[0]} 
                    readOnly
                  />
                  <span className="flex items-center text-gray-400">:</span>
                  <input 
                    type="text" 
                    className="flex-1 px-3 text-sm focus:outline-none"
                    value={modalState.time.split(':')[1] || '00'} 
                    readOnly
                  />
                  <div className="flex items-center px-3 border-l border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                    AM
                  </div>
                </div>
              </div>
              
              <Select label="Duration">
                <option>10 minutes</option>
                <option>20 minutes</option>
                <option>30 minutes</option>
                <option>45 minutes</option>
                <option>60 minutes</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalState({ ...modalState, isOpen: false })}>
              Cancel
            </Button>
            <Button>
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
