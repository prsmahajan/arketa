'use client';

import { useState, type ComponentType } from 'react';
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
  Star,
  SlidersHorizontal,
  X
} from 'lucide-react';

type SubItem = {
  label: string;
  href: string;
  badge?: string;
};

type MenuItem = {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  href: string;
  hasSubmenu?: boolean;
  subItems?: SubItem[];
};

const mainMenuItems: MenuItem[] = [
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
  { 
    icon: Sparkles, 
    label: 'Beyond Classes', 
    href: '/dashboard/beyond-classes', 
    hasSubmenu: true,
    subItems: [
      { label: 'On-Demand Video', href: '/dashboard/beyond-classes/video' },
      { label: 'Communities', href: '/dashboard/beyond-classes/communities' },
      { label: 'Retail Products', href: '/dashboard/beyond-classes/products' },
      { label: 'Invoices', href: '/dashboard/beyond-classes/invoices' },
      { label: 'Bulletin Board', href: '/dashboard/beyond-classes/board' },
    ]
  },
  {
    icon: Users,
    label: 'Customers',
    href: '/dashboard/customers',
    hasSubmenu: true,
    subItems: [
      { label: 'Clients', href: '/dashboard/customers/clients' },
      { label: 'Segments', href: '/dashboard/customers/segments' },
      { label: 'Comments', href: '/dashboard/customers/comments' },
    ]
  },
  {
    icon: Megaphone,
    label: 'Marketing',
    href: '/dashboard/marketing',
    hasSubmenu: true,
    subItems: [
      { label: 'Automations', href: '/dashboard/marketing/automations' },
      { label: 'Broadcasts', href: '/dashboard/marketing/broadcasts' },
      { label: 'Referrals', href: '/dashboard/marketing/referrals' },
      { label: 'Testimonials', href: '/dashboard/marketing/testimonials' },
    ]
  },
  {
    icon: PieChart,
    label: 'Analytics',
    href: '/dashboard/analytics',
    hasSubmenu: true,
    subItems: [
      { label: 'Dashboard', href: '/dashboard/analytics/dashboard' },
      { label: 'Reports', href: '/dashboard/analytics/reports' },
      { label: 'Benchmarks', href: '/dashboard/analytics/benchmarks', badge: 'NEW' },
    ]
  },
  {
    icon: Briefcase,
    label: 'Setup',
    href: '/dashboard/setup',
    hasSubmenu: true,
    subItems: [
      { label: 'Service Types', href: '/dashboard/setup/service-types' },
      { label: 'Pricing Options', href: '/dashboard/setup/pricing-options' },
      { label: 'Team', href: '/dashboard/setup/team' },
      { label: 'Promo Codes', href: '/dashboard/setup/promo-codes' },
      { label: 'Gift Cards', href: '/dashboard/setup/gift-cards' },
      { label: 'Achievements', href: '/dashboard/setup/achievements' },
    ]
  },
  {
    icon: Radio,
    label: 'Sales Channels',
    href: '/dashboard/sales-channels',
    hasSubmenu: true,
    subItems: [
      { label: 'Website Integration', href: '/dashboard/sales-channels/website-integration' },
      { label: 'Branded Website', href: '/dashboard/sales-channels/branded-website' },
      { label: 'Mobile App', href: '/dashboard/sales-channels/mobile-app' },
    ]
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed } = useUIStore();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState(false);
  const [draggedFavorite, setDraggedFavorite] = useState<string | null>(null);

  const allSubItems = mainMenuItems.flatMap((item) => item.subItems ?? []);
  const favoriteItems = favorites
    .map((href) => allSubItems.find((subItem) => subItem.href === href))
    .filter((subItem): subItem is SubItem => Boolean(subItem));

  const toggleItem = (label: string) => {
    if (isSidebarCollapsed) return;
    setExpandedItem((prev) => (prev === label ? null : label));
  };

  const toggleFavorite = (href: string) => {
    setFavorites((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const reorderFavorites = (sourceHref: string, targetHref: string) => {
    if (sourceHref === targetHref) return;
    setFavorites((prev) => {
      const sourceIndex = prev.indexOf(sourceHref);
      const targetIndex = prev.indexOf(targetHref);
      if (sourceIndex === -1 || targetIndex === -1) return prev;

      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
  };

  return (
    <>
      <aside 
        className={cn(
          "bg-[#FAFAFA] text-gray-900 flex flex-col h-screen fixed left-0 top-0 border-r border-gray-200 z-40 overflow-hidden font-sans transition-all duration-300",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}
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

        {!isSidebarCollapsed && (
          <>
            <div className="flex items-center justify-between rounded-lg px-4 py-2.5 text-[12px] font-medium text-gray-700">
              <div className="flex items-center gap-3">
                <Star size={16} strokeWidth={1.5} />
                <span>Favorites</span>
              </div>
              <button
                type="button"
                aria-label="Sort favorites"
                onClick={() => setIsFavoritesModalOpen(true)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <SlidersHorizontal size={14} strokeWidth={1.5} />
              </button>
            </div>

            {favoriteItems.map((favoriteItem) => {
              const isFavoriteActive = pathname === favoriteItem.href || pathname?.startsWith(`${favoriteItem.href}/`);
              return (
                <Link
                  key={favoriteItem.href}
                  href={favoriteItem.href}
                  className={cn(
                    'ml-9 flex h-8 items-center rounded-sm px-3 text-[13px] transition-colors',
                    isFavoriteActive
                      ? 'bg-gray-200 text-gray-900 font-medium'
                      : 'text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                  )}
                >
                  {favoriteItem.label}
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Menu */}
      <nav className="flex-1 py-2 space-y-0.5 px-3 overflow-y-auto bg-[#FAFAFA] scrollbar-none">
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const isSubItemActive =
            !!item.subItems?.some(
              (subItem) => pathname === subItem.href || pathname?.startsWith(`${subItem.href}/`)
            );
          const isActive =
            pathname === item.href ||
            pathname?.startsWith(`${item.href}/`) ||
            isSubItemActive;
          const isExpanded = !isSidebarCollapsed && expandedItem === item.label;
          
          if (!item.hasSubmenu) {
             return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center h-10 rounded-lg text-[13px] font-medium transition-colors',
                  isSidebarCollapsed ? "justify-center px-2" : "justify-start gap-3 px-3",
                  isActive
                    ? 'text-gray-900'
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
                  isExpanded ? 'bg-gray-100 text-gray-900' : '',
                  isActive ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
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
                    const isSubActive = pathname === subItem.href || pathname?.startsWith(`${subItem.href}/`);
                    const isFavorite = favorites.includes(subItem.href);
                    return (
                      <div
                        key={subItem.href}
                        className={cn(
                          'group flex items-center justify-between py-1.5 px-3 text-[13px] rounded-md transition-colors',
                          isSubActive
                            ? 'bg-gray-200 text-gray-900 font-medium'
                            : isFavorite
                              ? 'bg-gray-200 text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        )}
                      >
                        <Link href={subItem.href} className="min-w-0 flex-1">
                          <span>{subItem.label}</span>
                        </Link>
                        {subItem.badge ? (
                          <span className="rounded-md bg-[#dbeafe] px-2 py-0.5 text-[11px] font-semibold text-[#3b82f6]">
                            {subItem.badge}
                          </span>
                        ) : (
                          <button
                            type="button"
                            aria-label={isFavorite ? `Remove ${subItem.label} from favorites` : `Add ${subItem.label} to favorites`}
                            onClick={(event) => {
                              event.preventDefault();
                              toggleFavorite(subItem.href);
                            }}
                            className={cn(
                              'rounded p-0.5 transition-colors',
                              isFavorite
                                ? 'text-gray-600'
                                : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-500'
                            )}
                          >
                            <Star size={12} fill={isFavorite ? 'currentColor' : 'none'} />
                          </button>
                        )}
                      </div>
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

      {isFavoritesModalOpen && !isSidebarCollapsed && (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/10"
            onClick={() => {
              setIsFavoritesModalOpen(false);
              setDraggedFavorite(null);
            }}
            aria-label="Close favorites sort modal"
          />

          <div className="absolute left-[245px] top-[118px] w-[270px] rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-sm font-medium text-gray-800">Sort favorites</p>
              <button
                type="button"
                onClick={() => {
                  setIsFavoritesModalOpen(false);
                  setDraggedFavorite(null);
                }}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-0">
              {favoriteItems.length === 0 && (
                <div className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  No favorites yet
                </div>
              )}

              {favoriteItems.map((favoriteItem, index) => (
                <div
                  key={favoriteItem.href}
                  draggable
                  onDragStart={() => setDraggedFavorite(favoriteItem.href)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggedFavorite) {
                      reorderFavorites(draggedFavorite, favoriteItem.href);
                    }
                    setDraggedFavorite(null);
                  }}
                  onDragEnd={() => setDraggedFavorite(null)}
                  className={cn(
                    'flex cursor-grab items-center gap-3 px-2 py-3 active:cursor-grabbing',
                    index < favoriteItems.length - 1 ? 'border-b border-gray-200' : ''
                  )}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-gray-400"
                  >
                    <path d="M6 9h12" />
                    <path d="M6 15h12" />
                  </svg>
                  <span className="text-[12px] font-medium text-gray-800">{favoriteItem.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
