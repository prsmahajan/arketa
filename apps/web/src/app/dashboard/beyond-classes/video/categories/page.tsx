'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Grid, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';

export default function CategoriesPage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { communityId } = useAuthStore();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; created_at: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fromPath = useMemo(
    () => `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`,
    [pathname, searchParams]
  );

  const createHref = `/dashboard/beyond-classes/video/categories/new?activeCategoryTab=true&from=${encodeURIComponent(fromPath)}`;

  useEffect(() => {
    let active = true;
    async function fetchCategories() {
      if (!communityId) {
        if (active) {
          setCategories([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('video_categories')
          .select('id,name,created_at')
          .eq('community_id', communityId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (active) setCategories(data ?? []);
      } catch (error) {
        console.error(error);
        if (active) setCategories([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchCategories();
    return () => {
      active = false;
    };
  }, [communityId]);

  if (isLoading) {
    return <div className="h-full bg-white p-6 text-sm text-gray-500">Loading categories...</div>;
  }

  if (categories.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white p-12 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <Grid className="h-8 w-8 text-gray-400" />
        </div>

        <h3 className="mb-2 text-xl font-semibold text-gray-900">Organize your video library</h3>

        <p className="mb-8 max-w-md text-gray-500">
          Create categories to help clients browse and find the content that&apos;s right for them.
        </p>

        <Link href={createHref}>
          <Button className="bg-[#374151] px-6 text-white hover:bg-[#4B5563]">
            <Plus className="mr-1 h-4 w-4" />
            Add Category
          </Button>
        </Link>

        <div className="mt-8 flex items-center gap-2 text-sm text-gray-400">
          <Grid size={16} />
          <span>Video Categories</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white px-6 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
        <Link href={createHref}>
          <Button className="bg-[#374151] px-5 text-white hover:bg-[#4B5563]">
            <Plus className="mr-1 h-4 w-4" />
            Create new category
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <div className="grid grid-cols-[1.5fr_1fr] bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Name</span>
          <span>Created</span>
        </div>
        {categories.map((category) => (
          <div key={category.id} className="grid grid-cols-[1.5fr_1fr] border-t border-gray-100 px-4 py-3 text-sm text-gray-700">
            <span>{category.name}</span>
            <span>{new Date(category.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
