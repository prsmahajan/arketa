'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/ui-store';
import { SETTINGS_CATEGORIES } from './settings-data';

export function SettingsSidebar() {
  const router = useRouter();
  const { isSidebarCollapsed } = useUIStore();

  return (
    <aside
      className={cn(
        'bg-[#FAFAFA] text-gray-900 flex flex-col h-screen fixed left-0 top-0 border-r border-gray-200 z-50 overflow-hidden font-sans transition-all duration-300',
        isSidebarCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="h-12 flex items-center border-b border-gray-100 bg-white min-h-[48px] px-4">
        <button
          onClick={() => router.push('/dashboard')}
          className={cn(
            'flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors',
            isSidebarCollapsed && 'justify-center',
          )}
        >
          <ChevronLeft size={18} strokeWidth={1.5} />
          {!isSidebarCollapsed && <span>Settings</span>}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-none">
        {SETTINGS_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="mb-1 border-b border-gray-200">
              <div
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-gray-900',
                  isSidebarCollapsed && 'justify-center',
                )}
              >
                <Icon size={16} className="text-gray-500 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{category.title}</span>}
              </div>

              {!isSidebarCollapsed && (
                <div className="ml-[26px] space-y-0.5 mb-2">
                  {category.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-3 py-1 text-[12px] text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors truncate"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
