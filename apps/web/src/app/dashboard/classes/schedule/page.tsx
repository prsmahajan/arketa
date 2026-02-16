'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClassesHeader from '@/components/dashboard/classes-header';
import ScheduleFilters from '@/components/dashboard/filters/schedule-filters';
import ScheduleView from '@/components/dashboard/schedule/schedule-view';
import { ViewType } from '@/components/dashboard/filters/view-switcher';

export default function FullSchedulePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [view, setView] = useState<ViewType>('week');
  
  const dateParam = searchParams.get('date');
  
  const getSafeDate = () => {
    if (!dateParam) return new Date();
    const parts = dateParam.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };
  
  const dateObj = getSafeDate();

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Tabs */}
      <ClassesHeader />

      {/* Filters Bar */}
      <ScheduleFilters view={view} onViewChange={setView} />

      {/* Calendar Grid */}
      <ScheduleView 
        mode={view}
        date={dateObj}
        onSlotClick={() => router.push('/dashboard/classes/create')}
        className="flex-1 bg-white border-t border-gray-200"
      />
    </div>
  );
}
