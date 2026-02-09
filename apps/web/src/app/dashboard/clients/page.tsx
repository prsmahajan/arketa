'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Spinner, Card, Avatar, Badge } from '@/components/ui';
import { TableSkeleton } from '@/components/dashboard/skeletons';
import { Search, Mail, MoreHorizontal, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ClientsPage() {
  const { profile, communityId, isLoading: isAuthLoading } = useAuthStore();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (isAuthLoading) return;
    if (!communityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    try {
      const supabase = createClient();
      const query = supabase
        .from('memberships')
        .select('*, profile:profiles!memberships_user_id_fkey(*)')
        .eq('community_id', communityId)
        .order('joined_at', { ascending: false })
        .abortSignal(controller.signal);

      const { data, error: dbError } = await query;
      
      clearTimeout(timeoutId);
      if (dbError) throw dbError;
      setMembers(data || []);
    } catch (e: any) {
      console.error(e);
      if (e.name === 'AbortError' || e.message?.includes('aborted')) {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(e.message || 'Failed to load clients');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [communityId, isAuthLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isAuthLoading || loading) return <TableSkeleton />;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-between gap-4 text-red-800">
        <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
            <h3 className="font-bold">Error Loading Clients</h3>
            <p className="text-sm">{error}</p>
            </div>
        </div>
        <button onClick={loadData} className="px-4 py-2 bg-white rounded-xl text-sm font-bold border border-red-200 hover:bg-red-50 flex items-center gap-2">
            <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your community members</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50">
            <Filter size={16} /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D2F05D] rounded-xl text-sm font-bold text-black hover:bg-[#c2e04d]">
            + Add Client
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              className="w-full bg-gray-50 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Joined</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.profile.name} url={m.profile.avatar_url} />
                    <div>
                      <p className="font-bold text-gray-900">{m.profile.name}</p>
                      <p className="text-xs text-gray-500">{m.profile.email || 'No email'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant={m.status === 'active' ? 'success' : 'default'}>
                    {m.status.toUpperCase()}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-500">{formatDate(m.joined_at)}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{m.profile.role}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <Mail size={16} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No clients yet. Share your community link!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
