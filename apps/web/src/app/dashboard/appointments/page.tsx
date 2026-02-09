'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Spinner, Card, Avatar } from '@/components/ui';
import { GridSkeleton } from '@/components/dashboard/skeletons';
import { Calendar as CalendarIcon, Clock, MapPin, Video, MoreVertical, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function AppointmentsPage() {
  const { communityId, isLoading: isAuthLoading } = useAuthStore();
  const [classes, setClasses] = useState<any[]>([]);
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
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const supabase = createClient();
      const query = supabase
        .from('classes')
        .select('*, booking_count:bookings(count)')
        .eq('community_id', communityId)
        .order('date_time', { ascending: true })
        .abortSignal(controller.signal);
      
      const { data, error: dbError } = await query;
      
      clearTimeout(timeoutId);
      if (dbError) throw dbError;
      setClasses((data || []).map(c => ({...c, booking_count: c.booking_count?.[0]?.count || 0})));
    } catch (e: any) {
      console.error(e);
      if (e.name === 'AbortError' || e.message?.includes('aborted')) {
        setError('Request timed out. Please check your connection.');
      } else {
        setError(e.message || 'Failed to load appointments');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [communityId, isAuthLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isAuthLoading || loading) return <GridSkeleton />;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center justify-between gap-4 text-red-800">
        <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
            <h3 className="font-bold">Error Loading Appointments</h3>
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Upcoming classes and sessions</p>
        </div>
        <button className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
          + New Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget (Mock) */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full">
            <h3 className="font-bold text-lg mb-4">Calendar</h3>
            <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
              Calendar Component
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-lg px-2">Upcoming Sessions</h3>
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-start gap-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex-shrink-0 w-16 h-16 bg-[#F4F4F5] rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-gray-500 uppercase">{new Date(cls.date_time).toLocaleString('en-US', { month: 'short' })}</span>
                <span className="text-xl font-black text-gray-900">{new Date(cls.date_time).getDate()}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-lg text-gray-900">{cls.title}</h4>
                  <button className="text-gray-400 hover:text-black"><MoreVertical size={20} /></button>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-[#D2F05D]" />
                    {new Date(cls.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {cls.duration_minutes}m
                  </div>
                  <div className="flex items-center gap-1.5">
                    {cls.location_type === 'zoom' ? <Video size={16} className="text-blue-400" /> : <MapPin size={16} className="text-red-400" />}
                    {cls.location_type === 'zoom' ? 'Online' : cls.location_value}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(3, cls.booking_count))].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"></div>
                    ))}
                    {cls.booking_count > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold">
                        +{cls.booking_count - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-gray-600">
                    {cls.booking_count} Attendees
                  </span>
                </div>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-500">No upcoming sessions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
