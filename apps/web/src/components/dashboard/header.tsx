'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useUIStore } from '@/lib/ui-store';
import { Search, Plus, HelpCircle, PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DashboardHeader() {
  const { profile } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const pathname = usePathname();

  // Route → title mapping. Longest prefix wins.
  const ROUTES: Record<string, string> = {
    '/dashboard/classes/schedule': 'Classes > Full Schedule',
    '/dashboard/classes/appointments': 'Classes > Appointments',
    '/dashboard/classes/events': 'Classes > Events',
    '/dashboard/classes/create': 'Classes > Create',
    '/dashboard/classes/classes': 'Classes > Classes',
    '/dashboard/classes': 'Classes',
    '/dashboard/beyond-classes/video': 'Beyond Classes > Video',
    '/dashboard/beyond-classes/communities': 'Beyond Classes > Communities',
    '/dashboard/beyond-classes/products': 'Beyond Classes > Products',
    '/dashboard/beyond-classes/invoices': 'Beyond Classes > Invoices',
    '/dashboard/beyond-classes/board': 'Beyond Classes > Board',
    '/dashboard/beyond-classes': 'Beyond Classes',
    '/dashboard/customers/clients': 'Customers > Clients',
    '/dashboard/customers/segments': 'Customers > Segments',
    '/dashboard/customers/comments': 'Customers > Comments',
    '/dashboard/customers': 'Customers',
    '/dashboard/availability': 'Availability',
    '/dashboard/appointments': 'Appointments',
    '/dashboard/clients': 'Clients',
    '/dashboard/chats': 'Chats',
    '/dashboard/feed': 'Feed',
    '/dashboard/club': 'Club',
    '/dashboard/marathon': 'Marathon',
    '/dashboard/meals': 'Meals',
    '/dashboard/workout': 'Workout',
    '/dashboard/portfolio': 'Portfolio',
    '/dashboard/users': 'Users',
    '/dashboard/settings': 'Settings',
    '/settings': 'Settings',
  };

  const matched = Object.keys(ROUTES)
    .filter((r) => pathname.startsWith(r))
    .sort((a, b) => b.length - a.length)[0];

  const raw = matched ? ROUTES[matched] : 'Home';
  const [title, subtitle] = raw.includes(' > ') ? raw.split(' > ') : [raw, ''];

  return (
    <header className="h-12 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <button 
            onClick={toggleSidebar}
            className="text-gray-900 hover:text-gray-800 transition-colors"
          >
            <PanelLeft size={20} />
          </button>
          <span className="text-gray-300">|</span>
          <span className={cn("font-medium", subtitle ? "text-gray-500" : "text-gray-900")}>
            {title}
          </span>
          {subtitle && (
            <>
              <span className="text-gray-300">{'>'}</span>
              <span className="font-medium text-gray-900">{subtitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-xl mx-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-200 hover:bg-gray-200 focus:bg-white text-sm text-gray-900 rounded-md pl-9 pr-4 py-1 border border-transparent focus:border-gray-200 focus:outline-none focus:ring-0 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-1 justify-end">
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Plus size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <HelpCircle size={20} />
        </button>
        <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium text-xs border border-gray-200 ml-2">
          {profile?.name?.charAt(0) || 'A'}
        </button>
      </div>
    </header>
  );
}
