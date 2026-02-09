'use client';

import { 
  ChevronLeft, 
  ChevronRight, 
  ClipboardList 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';

import ClassesHeader from '@/components/dashboard/classes-header';
import ScheduleFilters from '@/components/dashboard/filters/schedule-filters';

export default function FullSchedulePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      {/* Tabs */}
      <ClassesHeader />

      {/* Filters Bar */}
      <ScheduleFilters />

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-12 h-12 mb-4 text-gray-400">
          <ClipboardList size={48} strokeWidth={1} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">No full schedule found</h3>
        <p className="text-sm text-gray-500 mb-6">Start by creating a class</p>
        <Button 
          className="bg-[#374151] hover:bg-[#1f2937] text-white text-sm h-9 px-4"
          onClick={() => router.push('/dashboard/classes/create')}
        >
          Add new
        </Button>
      </div>
    </div>
  );
}
