'use client';

import { Check } from 'lucide-react';
import { usePathname } from 'next/navigation';

const features = [
  'Marketing & Growth',
  '1-on-1 Appointments',
  'Group Class Scheduling',
  'Courses & Digital Products',
  'Management & Analytics',
  'Branded Mobile Apps and Websites',
];

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden lg:flex w-1/3 max-w-sm bg-[#2C333A] text-white p-12 flex-col">
        <div className="mb-12">
          <div className="flex items-center gap-2">
            <div className="flex gap-[3px]">
              <div className="w-[10px] h-6 border-2 border-white rounded-l-full border-r-0"></div>
              <div className="w-[10px] h-6 bg-white rounded-r-full"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight">arketa</span>
          </div>
        </div>

        <div className="bg-[#374151] rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold mb-6">Get started</h2>
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="mt-1">
                  <Check size={16} className="text-[#4ADE80]" strokeWidth={3} />
                </div>
                <span className="text-gray-200 font-medium text-sm leading-snug">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
