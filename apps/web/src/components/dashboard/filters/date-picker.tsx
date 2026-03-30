'use client';

import Calendar from '@/components/ui/calendar';

interface DatePickerProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export default function DatePicker({ selectedDate, onSelect, onClose }: DatePickerProps) {
  return (
    <div className="absolute left-0 top-full z-50 mt-2 animate-in fade-in zoom-in-95 duration-200">
      <Calendar
        selected={selectedDate}
        onSelect={onSelect}
        onClose={onClose}
        className="w-[320px] rounded-xl border-gray-100 p-4 shadow-xl"
      />
    </div>
  );
}
