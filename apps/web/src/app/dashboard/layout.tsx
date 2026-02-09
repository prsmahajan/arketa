'use client';

import React from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { useUIStore } from '@/lib/ui-store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useUIStore();
  
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <Sidebar />
      <div className={cn(
        "transition-all duration-300",
        isSidebarCollapsed ? "pl-16" : "pl-64"
      )}>
        <DashboardHeader />
        <main className="max-w-[1600px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
