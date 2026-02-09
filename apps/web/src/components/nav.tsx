'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { createClient } from '@/lib/supabase';
import { cn, getInitials } from '@/lib/utils';
import { Home, BookOpen, Calendar, BarChart3, LogOut } from 'lucide-react';

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useAuthStore();

  if (!profile) return null;

  const isCreator = profile.role === 'creator';

  const links = [
    { href: '/', label: 'Community', icon: Home },
    { href: '/programs', label: 'Programs', icon: BookOpen },
    { href: '/classes', label: 'Classes', icon: Calendar },
    ...(isCreator ? [{ href: '/dashboard', label: 'Dashboard', icon: BarChart3 }] : []),
  ];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    useAuthStore.getState().clear();
    router.push('/auth');
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight hidden sm:block">arketa</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50',
                  )}
                >
                  <Icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <Link href="/settings" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center text-xs font-bold border border-gray-200">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  getInitials(profile.name)
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 hidden sm:block">
                {profile.name}
              </span>
              {isCreator && (
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded-full border border-gray-200 hidden sm:block">
                  CREATOR
                </span>
              )}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex gap-1 pb-3 -mx-1 overflow-x-auto scrollbar-none">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                <Icon size={14} />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
