'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { 
  Filter, 
  Copy, 
  ChevronDown, 
  Video, 
  Grid, 
  Folder 
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function VideoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { label: 'Videos', href: '/dashboard/beyond-classes/video/videos' },
    { label: 'Categories', href: '/dashboard/beyond-classes/video/categories' },
    { label: 'Collections', href: '/dashboard/beyond-classes/video/collections' },
  ];

  const addNewOptions = [
    { label: 'Video', icon: <Video size={16} /> },
    { label: 'Category', icon: <Grid size={16} /> },
    { label: 'Collection', icon: <Folder size={16} /> },
  ];

  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeTab) {
        setIndicatorStyle({
          left: activeTab.offsetLeft,
          width: activeTab.offsetWidth
        });
      }
    }
  }, [pathname]);

  const isCreatePage = pathname?.includes('/create');
  const isVideosPage = pathname === '/dashboard/beyond-classes/video/videos';

  if (isCreatePage) {
    return <div className="h-full bg-white">{children}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header Section */}
      <div className="px-6 pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">On Demand</h1>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" className="h-9 text-sm gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
              <Filter size={14} />
              Manage Video Filters
            </Button>
            <Button variant="outline" className="h-9 text-sm gap-2 border-gray-200 text-gray-700 hover:bg-gray-50">
              <Copy size={14} />
              Copy library URL
            </Button>
            
            <div className="relative">
              <Button 
                className="bg-[#111] hover:bg-black text-white h-9 px-4 text-sm gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                Add new <ChevronDown size={14} />
              </Button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                  {addNewOptions.map((option) => (
                    <button
                      key={option.label}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="text-gray-500">{option.icon}</span>
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {!isVideosPage && (
          <div className="relative border-b border-gray-200" ref={tabsRef}>
            <div className="flex items-center gap-8">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    data-active={isActive}
                    className={cn(
                      "pb-3 text-sm font-semibold transition-colors relative z-10",
                      isActive 
                        ? "text-gray-900" 
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
            <div 
              className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-in-out z-20"
              style={{ 
                left: `${indicatorStyle.left}px`, 
                width: `${indicatorStyle.width}px` 
              }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 bg-white">
        {children}
      </div>
    </div>
  );
}
