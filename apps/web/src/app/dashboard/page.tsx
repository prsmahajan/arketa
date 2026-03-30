'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Calendar,
  ArrowRight,
  PieChart,
  HelpCircle,
  MoreHorizontal,
  BarChart2,
  AlertCircle,
  SlidersHorizontal,
  Star,
  Download,
  X,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import { useUIStore } from '@/lib/ui-store';
import { CustomizeDashboardModal } from '@/components/dashboard/customize-dashboard-modal';

// Custom dashed/segmented circle for incomplete tasks
function TaskCircle({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      className="flex-shrink-0"
    >
      <circle
        cx="10"
        cy="10"
        r="8.5"
        stroke="#d1d5db"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CardMenu({ variant = 'stat' }: { variant?: 'stat' | 'chart' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-gray-300 transition-colors hover:text-gray-500"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 top-7 z-10 min-w-[140px] rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          <button
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Star size={14} className="text-gray-400" />
            Favorite
          </button>
          {variant === 'chart' && (
            <button
              disabled
              className="flex w-full items-center gap-2 whitespace-nowrap px-3 py-1.5 text-sm text-gray-300 cursor-not-allowed"
            >
              <Download size={14} className="text-gray-300" />
              Export CSV
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('All');
  const { openCustomizeDashboard, dashboardCards } = useUIStore();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSetupGuide, setShowSetupGuide] = useState(true);
  const [showSurvey, setShowSurvey] = useState(true);
  const [connectAccountsOpen, setConnectAccountsOpen] = useState(true);
  const [launchTipsOpen, setLaunchTipsOpen] = useState(true);

  const enabledCards = dashboardCards.filter((c) => c.enabled);

  const tabs = [
    { label: 'All', count: 0 },
    { label: 'Failed Subscriptions', count: 0 },
    { label: 'Class Packs Low', count: 0 },
    { label: 'Class Packs Expiring', count: 0 },
    { label: 'Tasks Assigned', count: 0 },
  ];

  // Render each card section by ID
  const renderCard = (cardId: string) => {
    switch (cardId) {
      case 'notification-center':
        return (
          <Card
            key={cardId}
            className="flex min-h-[300px] flex-col overflow-hidden border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 p-5">
              <Bell size={18} className="text-gray-500" />
              <h2 className="font-bold text-gray-900">Notification Center</h2>
            </div>

            <div className="flex items-center overflow-x-auto border-b border-gray-100 px-2 pt-2">
              {tabs.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.label
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-200 hover:text-gray-700',
                  )}
                >
                  {tab.label}
                  <span className="min-w-[20px] rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-center text-[10px] text-gray-600">
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-1 flex-col items-center justify-center p-12 text-center text-sm text-gray-400">
              No items to review
            </div>
          </Card>
        );

      case 'upcoming-schedule':
        return (
          <Card
            key={cardId}
            className="flex min-h-[300px] flex-col overflow-hidden border border-gray-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-500" />
                <h2 className="font-bold text-gray-900">Upcoming Schedule</h2>
              </div>
              <button className="flex items-center gap-1 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-500 transition-colors hover:text-black">
                Go to schedule <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center p-12 text-center text-sm text-gray-400">
              No upcoming or in-progress classes
            </div>
          </Card>
        );

      case 'favorite-reports':
        return (
          <div key={cardId} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <PieChart size={18} className="text-gray-500" />
                  <h2 className="text-base font-bold text-gray-900">Favorite Reports</h2>
                </div>
                <p className="mt-0.5 pl-7 text-xs text-gray-400">Last 7 days</p>
              </div>
              <button className="flex items-center gap-1 rounded border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:text-black">
                Go to favorites <ArrowRight size={12} />
              </button>
            </div>

            {/* Row 1: Stat cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Total Sales', value: '$0.00', hasHelp: true },
                { label: 'Active Memberships (All Time)', value: '0', hasHelp: false },
                { label: 'Total Visits', value: '0', hasHelp: true },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex h-[140px] flex-col rounded-lg border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {stat.label}
                      </span>
                      {stat.hasHelp && <HelpCircle size={12} className="text-gray-300" />}
                    </div>
                    <CardMenu />
                  </div>
                  <h3 className="mt-4 text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Row 2: Chart cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: 'Sales by Category', hasHelp: true },
                { label: 'Sales Over Time', hasHelp: false },
                { label: 'Visits Over Time', hasHelp: true },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="flex h-[280px] flex-col rounded-lg border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {metric.label}
                      </span>
                      {metric.hasHelp && <HelpCircle size={12} className="text-gray-300" />}
                    </div>
                    <CardMenu variant="chart" />
                  </div>
                  <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                    <BarChart2 size={36} className="text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">
                      No data matches your filters
                    </p>
                    <p className="max-w-[200px] text-xs text-gray-400">
                      Try adjusting your filters or date range to see results.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <CustomizeDashboardModal />
      <div className="space-y-6 p-6">

        {/* Payments disabled banner */}
        <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <AlertCircle size={16} className="flex-shrink-0 text-gray-400" />
            Payments disabled&nbsp;
            <span className="text-gray-500">Connect your Payments account to enable payments</span>
          </div>
          <button className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50">
            Connect
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Home</h1>
          <button
            onClick={openCustomizeDashboard}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            <SlidersHorizontal size={14} />
            Customize Dashboard
          </button>
        </div>

        {/* Dashboard cards — rendered in saved order */}
        {enabledCards.map((card) => renderCard(card.id))}

        {/* Onboarding Session */}
        {showOnboarding && (
          <div className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900">Join an Onboarding Session</h3>
            <p className="mt-1 text-sm text-gray-500">
              Join us live on Zoom, 5 days a week, to get you set up and ready for launch!
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800">
                Book Onboarding Session
              </button>
              <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                Watch Onboarding Video
              </button>
            </div>
          </div>
        )}

        {/* Setup Guide */}
        {showSetupGuide && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Setup Guide Header */}
            <div className="relative p-6">
              <button
                onClick={() => setShowSetupGuide(false)}
                className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={18} />
              </button>
              <h3 className="text-lg font-bold text-gray-900">Setup guide</h3>
              <p className="mt-1 text-sm text-gray-500">
                Use this personalized guide to get your business up and running.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-sm font-medium text-blue-600">0/8 tasks completed</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full w-0 rounded-full bg-blue-600 transition-all" />
                </div>
              </div>
            </div>

            {/* CONNECT ACCOUNTS */}
            <div>
              <button
                onClick={() => setConnectAccountsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between bg-gray-50 px-6 py-3 text-left"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Connect Accounts
                </span>
                {connectAccountsOpen ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {connectAccountsOpen && (
                <div className="divide-y divide-gray-100">
                  <div className="flex items-center gap-3 px-6 py-4">
                    <TaskCircle />
                    <span className="flex-1 text-sm font-semibold text-gray-900">Set up payments</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4">
                    <TaskCircle />
                    <span className="flex-1 text-sm font-semibold text-gray-900">Set up business details</span>
                    <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50">
                      Go to settings
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LAUNCH TIPS */}
            <div>
              <button
                onClick={() => setLaunchTipsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between bg-gray-50 px-6 py-3 text-left"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Launch Tips
                </span>
                {launchTipsOpen ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>

              {launchTipsOpen && (
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Add your first service', action: 'Add service' },
                    { label: 'Add pricing options', action: 'Build pricing' },
                    { label: 'Add your first class', action: 'Add schedule' },
                    { label: 'Add your private availability', action: 'Add availability' },
                    { label: 'Add your first video', action: 'Upload video' },
                    { label: 'Launch your business', action: 'Launch now' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3 px-6 py-4">
                      <TaskCircle />
                      <span className="flex-1 text-sm font-semibold text-gray-900">{item.label}</span>
                      <button className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50">
                        {item.action}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Studio Survey */}
        {showSurvey && (
          <div className="relative rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <button
              onClick={() => setShowSurvey(false)}
              className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-gray-900">Studio Survey</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-3xl">
              Each year we run the Aghor Studio Survey to get a pulse on the industry. Your input helps us build better products, identify growth opportunities, and provide smarter, data-driven insights. All data is fully anonymized and aggregated.
            </p>
            <button className="mt-4 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
              Take Survey
            </button>
          </div>
        )}

        {/* My Appointment Availability */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">My Appointment Availability</h3>
            <Link
              href="/dashboard/availability"
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Edit Availability
            </Link>
          </div>

          <div className="mt-4 divide-y divide-gray-100">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="flex items-center gap-8 py-3">
                <span className="w-10 text-sm font-bold text-gray-900">{day}</span>
                <span className="text-sm text-rose-300">Unavailable</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
