'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronDown, X, MoreHorizontal, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';

type VideoRow = {
  id: string;
  name: string;
  created_at: string;
  rental_price_cents: number;
  status: 'live' | 'hidden' | 'draft';
  preview_image_url: string | null;
  preview_image_name: string | null;
  on_demand_video_categories: Array<{
    video_categories: { name: string } | null;
  }> | null;
};

function formatCreatedAt(value: string) {
  const date = new Date(value);
  const datePart = date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${datePart} GMT${sign}${hh}:${mm}`;
}

export default function VideosPage() {
  const { communityId } = useAuthStore();
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const statusRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setStatusOpen(false);
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) setCategoryOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    let active = true;
    async function loadVideos() {
      if (!communityId) {
        if (active) {
          setVideos([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('on_demand_videos')
          .select(`
            id,
            name,
            created_at,
            rental_price_cents,
            status,
            preview_image_url,
            preview_image_name,
            on_demand_video_categories (
              video_categories (
                name
              )
            )
          `)
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (active) setVideos((data as VideoRow[]) ?? []);
      } catch (error) {
        console.error(error);
        if (active) setVideos([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadVideos();
    return () => {
      active = false;
    };
  }, [communityId]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((video) => {
      video.on_demand_video_categories?.forEach((link) => {
        if (link.video_categories?.name) set.add(link.video_categories.name);
      });
    });
    return Array.from(set);
  }, [videos]);

  const filtered = useMemo(() => {
    return videos.filter((video) => {
      const categoryNames = (video.on_demand_video_categories ?? [])
        .map((link) => link.video_categories?.name)
        .filter(Boolean) as string[];

      const matchesSearch =
        !search.trim() ||
        video.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        categoryNames.some((name) => name.toLowerCase().includes(search.trim().toLowerCase()));
      const matchesStatus = !selectedStatus || video.status === selectedStatus;
      const matchesCategory = !selectedCategory || categoryNames.includes(selectedCategory);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [videos, search, selectedStatus, selectedCategory]);

  const visible = filtered.slice(0, pageSize);
  const hasAnyVideos = videos.length > 0;
  const tabs = [
    { label: 'Videos', href: '/dashboard/beyond-classes/video/videos', isActive: true },
    { label: 'Categories', href: '/dashboard/beyond-classes/video/categories', isActive: false },
    { label: 'Collections', href: '/dashboard/beyond-classes/video/collections', isActive: false },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-gray-200 px-6 py-4">
          <div className="mb-4 rounded-md bg-[#f3f4f6] px-4 py-3 text-sm text-gray-600">
            <div className='space-x-2'>
            <span className='text-gray-700 font-semibold'>🎥 Looking for premium video?</span> Upgrade your account to enable premium video storage and streaming. Includes 10GB file limits and 20 hours of new video uploads per month. 
            {' '}<span className="font-semibold text-gray-800 underline">Upgrade here</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative w-[330px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search videos..."
                className="h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={categoryRef}>
                <button
                  type="button"
                  onClick={() => setCategoryOpen((value) => !value)}
                  className="flex h-10 w-[230px] items-center justify-between rounded-md border border-gray-200 px-3 text-sm text-gray-600"
                >
                  <span>{selectedCategory || 'Categories'}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {categoryOpen && (
                  <div className="absolute right-0 top-11 z-50 w-[230px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                    <button type="button" onClick={() => { setSelectedCategory(''); setCategoryOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button key={category} type="button" onClick={() => { setSelectedCategory(category); setCategoryOpen(false); }} className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={statusRef}>
                <button
                  type="button"
                  onClick={() => setStatusOpen((value) => !value)}
                  className="flex h-10 w-[230px] items-center justify-between rounded-md border border-gray-200 px-3 text-sm text-gray-600"
                >
                  <span>{selectedStatus ? selectedStatus[0].toUpperCase() + selectedStatus.slice(1) : 'Status'}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {statusOpen && (
                  <div className="absolute right-0 top-11 z-50 w-[230px] rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                    {['live', 'hidden', 'draft'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => { setSelectedStatus(status); setStatusOpen(false); }}
                        className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {status[0].toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedCategory(''); setSelectedStatus(''); }}
                className="flex h-10 items-center gap-1 rounded-md bg-[#9ca3af] px-4 text-sm font-medium text-white hover:bg-[#6b7280]"
              >
                <X size={14} />
                Clear all
              </button>
          </div>
        </div>

        <div className="relative mt-5 border-b border-gray-200">
          <div className="flex items-center gap-8">
            {tabs.map((tab) => (
              <Link
                key={tab.label}
                href={tab.href}
                className={cn(
                  'relative z-10 pb-3'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold',
                    tab.isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            ))}
          </div>
          <div className="absolute bottom-0 left-0 h-0.5 w-10 bg-gray-900" />
        </div>
      </div>

      <div className="flex-1 px-1 pb-5 pt-4">
        {!isLoading && !hasAnyVideos ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h3 className="mb-2 text-xl font-semibold leading-tight text-gray-900">Share your expertise on demand</h3>
            <p className="mb-4 text-sm max-w-[460px] text-center text-gray-700">
              Upload videos so clients can practice anytime, anywhere -- from recorded classes to tutorials and wellness guides.
            </p>
            <Link href="/dashboard/beyond-classes/video/create">
              <button type="button" className="cursor-pointer rounded-lg bg-[#2f3136] px-4 py-2 text-sm font-medium text-white hover:bg-[#22252b]">
                Add Video
              </button>
            </Link>
            <div className="mt-10 flex w-[240px] items-center justify-center border-t border-gray-200 pt-6 text-sm text-gray-400">
              <GraduationCap className="mr-2 h-5 w-5" />
              On-Demand Videos
            </div>
          </div>
        ) : (
          <>
        <div className="overflow-hidden border-y border-gray-200">
          <div className="grid grid-cols-[2fr_1fr_2fr_1.3fr_1.2fr_1.2fr_1fr] bg-gray-100 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-gray-600">
            <span>Preview</span>
            <span>Name</span>
            <span>Created</span>
            <span>Categories</span>
            <span>Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {isLoading && <div className="px-6 py-8 text-sm text-gray-500">Loading videos...</div>}

          {!isLoading && hasAnyVideos && visible.length === 0 && (
            <div className="px-6 py-8 text-sm text-gray-500">
              No videos yet. <Link href="/dashboard/beyond-classes/video/create" className="text-blue-600 underline">Add your first video</Link>.
            </div>
          )}

          {!isLoading && visible.map((video) => {
            const categoryNames = (video.on_demand_video_categories ?? [])
              .map((link) => link.video_categories?.name)
              .filter(Boolean) as string[];
            const priceText = video.rental_price_cents > 0 ? `Rent for $${(video.rental_price_cents / 100).toFixed(2)}` : 'Included';
            return (
              <div key={video.id} className="grid grid-cols-[2fr_1fr_2fr_1.3fr_1.2fr_1.2fr_1fr] items-center border-t border-gray-200 px-6 py-4 text-sm text-gray-700">
                <div className="flex h-[82px] w-[210px] items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs text-gray-400">
                  {video.preview_image_name || 'No preview'}
                </div>
                <div className="font-semibold text-gray-700">{video.name}</div>
                <div>{formatCreatedAt(video.created_at)}</div>
                <div>{categoryNames.join(', ') || '-'}</div>
                <div>{priceText}</div>
                <div>
                  <span className={`inline-flex rounded-full px-4 py-1 text-sm font-semibold ${video.status === 'live' ? 'bg-[#d7efe4] text-[#228b5f]' : 'bg-gray-200 text-gray-600'}`}>
                    {video.status[0].toUpperCase() + video.status.slice(1)}
                  </span>
                </div>
                <button type="button" className="text-gray-500 hover:text-gray-700">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold">1</span> - <span className="font-semibold">{visible.length}</span> of{' '}
              <span className="font-semibold">{filtered.length}</span>
            </span>
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="h-11 rounded-xl border border-gray-300 px-3 text-sm text-gray-700"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="inline-flex overflow-hidden rounded-xl border border-gray-300 text-sm">
            <button type="button" className="px-4 py-2 text-gray-500 hover:bg-gray-50">‹</button>
            <span className="border-l border-r border-gray-300 px-6 py-2 text-gray-700">1</span>
            <button type="button" className="px-4 py-2 text-gray-500 hover:bg-gray-50">›</button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
