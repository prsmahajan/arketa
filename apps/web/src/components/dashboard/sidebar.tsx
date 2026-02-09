'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/ui-store';
import {
  Home,
  ShoppingBag,
  ClipboardList,
  Sparkles,
  Users,
  Megaphone,
  PieChart,
  Briefcase,
  Radio,
  Settings,
  Gift,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';

const mainMenuItems = [
  { 
    icon: ClipboardList, 
    label: 'Classes', 
    href: '/dashboard/classes',
    hasSubmenu: true,
    subItems: [
      { label: 'Full Schedule', href: '/dashboard/classes/schedule' },
      { label: 'Classes', href: '/dashboard/classes/classes' },
      { label: 'Appointments', href: '/dashboard/classes/appointments' },
      { label: 'Events', href: '/dashboard/classes/events' },
    ]
  },
  { icon: Sparkles, label: 'Beyond Classes', href: '/dashboard/beyond-classes', hasSubmenu: true },
  { icon: Users, label: 'Customers', href: '/dashboard/customers', hasSubmenu: true },
  { icon: Megaphone, label: 'Marketing', href: '/dashboard/marketing', hasSubmenu: true },
  { icon: PieChart, label: 'Analytics', href: '/dashboard/analytics', hasSubmenu: true },
  { icon: Briefcase, label: 'Setup', href: '/dashboard/setup', hasSubmenu: true },
  { icon: Radio, label: 'Sales Channels', href: '/dashboard/sales-channels', hasSubmenu: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUIStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Classes']);

  const toggleItem = (label: string) => {
    if (isSidebarCollapsed) return;
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside 
      className={cn(
        "bg-[#FAFAFA] text-gray-900 flex flex-col h-screen fixed left-0 top-0 border-r border-gray-200 z-40 overflow-hidden font-sans transition-all duration-300",
        isSidebarCollapsed ? "w-16" : "w-64"
      )}
      style={{ fontFamily: 'Avenir, Helvetica, Arial, sans-serif' }}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-white min-h-[64px]">
        {isSidebarCollapsed ? (
          <span className="font-bold text-lg">A</span>
        ) : (
          <span className="font-bold text-lg tracking-tight w-full px-6">Your Studio</span>
        )}
      </div>

      {/* Top Section */}
      <div className="p-4 bg-white border-b border-gray-100 space-y-1">
        <button className={cn(
          "w-full flex items-center gap-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-medium rounded-lg transition-colors shadow-sm text-[12px]",
          isSidebarCollapsed ? "justify-center p-2" : "justify-start py-2.5 px-4"
        )}
        title={isSidebarCollapsed ? "New Sale" : undefined}
        >
          <ShoppingBag size={18} strokeWidth={1.5} />
          {!isSidebarCollapsed && <span>New Sale</span>}
        </button>

        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-3 w-full rounded-lg text-[12px] font-medium transition-colors",
            pathname === '/dashboard' 
              ? "bg-gray-200 text-gray-900" 
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
            isSidebarCollapsed ? "justify-center p-2" : "justify-start py-2.5 px-4"
          )}
          title={isSidebarCollapsed ? "Home" : undefined}
        >
          <Home size={18} strokeWidth={1.5} />
          {!isSidebarCollapsed && <span>Home</span>}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-2 space-y-0.5 px-3 overflow-y-auto bg-[#FAFAFA] scrollbar-none">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href && !item.hasSubmenu;
          const isExpanded = expandedItems.includes(item.label);
          
          if (!item.hasSubmenu) {
             return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center h-10 rounded-lg text-[13px] font-medium transition-colors',
                  isSidebarCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3",
                  isActive
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon size={18} strokeWidth={1.5} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
             );
          }
          
          return (
            <div key={item.label}>
              <button
                onClick={() => toggleItem(item.label)}
                className={cn(
                  'w-full flex items-center h-10 rounded-lg text-[13px] font-medium transition-colors cursor-pointer',
                  isSidebarCollapsed ? "justify-center px-2" : "justify-between px-3",
                  isActive
                    ? 'bg-gray-200 text-gray-900'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className={cn("flex items-center gap-3", isSidebarCollapsed && "justify-center")}>
                  <Icon size={18} strokeWidth={1.5} />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!isSidebarCollapsed && item.hasSubmenu && (
                  isExpanded ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />
                )}
              </button>

              {/* Submenu */}
              {!isSidebarCollapsed && item.hasSubmenu && isExpanded && item.subItems && (
                <div className="ml-9 space-y-0.5 mt-0.5 mb-1">
                  {item.subItems.map((subItem) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'group flex items-center justify-between py-1.5 px-3 text-[13px] rounded-md transition-colors',
                          isSubActive
                            ? 'bg-gray-200 text-gray-900 font-medium'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        )}
                      >
                        <span>{subItem.label}</span>
                        <Star size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-1 bg-[#FAFAFA]">
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center h-10 rounded-lg text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors",
            isSidebarCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3"
          )}
          title={isSidebarCollapsed ? "Settings" : undefined}
        >
          <Settings size={18} strokeWidth={1.5} />
          {!isSidebarCollapsed && <span>Settings</span>}
        </Link>
        <Link
          href="/dashboard/referrals"
          className={cn(
            "flex items-center h-10 rounded-lg text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors",
            isSidebarCollapsed ? "justify-center px-2" : "justify-between px-3"
          )}
          title={isSidebarCollapsed ? "Refer and earn" : undefined}
        >
          <div className="flex items-center gap-3">
            <Gift size={18} strokeWidth={1.5} />
            {!isSidebarCollapsed && <span>Refer and earn</span>}
          </div>
          {!isSidebarCollapsed && (
            <span className="bg-[#E6F4EA] text-[#1E8E3E] text-[11px] font-bold px-1.5 py-0.5 rounded">
              $50
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
