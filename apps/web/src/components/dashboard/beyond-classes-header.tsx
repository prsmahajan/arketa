'use client';

import { useState } from 'react';
import { 
  Plus, 
  ChevronDown,
  Play,
  Users,
  ShoppingBag,
  FileText,
  Pin
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function BeyondClassesHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const tabs = [
    { label: 'On-Demand Video', href: '/dashboard/beyond-classes/video' },
    { label: 'Communities', href: '/dashboard/beyond-classes/communities' },
    { label: 'Retail Products', href: '/dashboard/beyond-classes/products' },
    { label: 'Invoices', href: '/dashboard/beyond-classes/invoices' },
    { label: 'Bulletin Board', href: '/dashboard/beyond-classes/board' },
  ];

  const subOptions = [
    { label: 'New video', icon: <Play size={16} /> },
    { label: 'New community', icon: <Users size={16} /> },
    { label: 'New product', icon: <ShoppingBag size={16} /> },
    { label: 'New invoice', icon: <FileText size={16} /> },
    { label: 'New board', icon: <Pin size={16} /> },
  ];

  return (
    <>
      <div className="flex items-center justify-between border-b border-t border-[#bbb] px-3 py-2">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive 
                    ? "bg-gray-200 text-[#111]"
                    : "text-[#111] hover:text-gray-900 hover:bg-gray-200"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
          <button className="px-4 py-2 text-sm font-medium cursor-pointer text-[#111] hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors">
            + Custom View
          </button>
        </div>

        <div className="relative">
          <Button 
            className="bg-black text-white hover:bg-gray-800 text-xs h-8 px-3 outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Add new <ChevronDown size={14} className="ml-2" />
          </Button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-50">
              {subOptions.map((option) => (
                <button
                  key={option.label}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    // option.onClick?.();
                  }}
                >
                  <span className="text-gray-400">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
