'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Card, Button, Spinner, EmptyState, Badge, Input, Textarea } from '@/components/ui';
import { formatDateTime, cn } from '@/lib/utils';
import { Calendar, MapPin, Video, Clock, Plus, X, Check } from 'lucide-react';
import type { Class } from '@aghor/shared';

import { PageLayout } from '@/components/page-layout';

export default function ClassesPage() {
  const router = useRouter();
  // ... existing code ...

  if (isLoading || loading) return <Spinner />;

  const isCreator = profile?.role === 'creator';

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        {/* ... existing content ... */}
      </div>

      {showCreate && (
        <CreateClassForm
          communityId={communityId!}
          onCreated={(c) => { setClasses((prev) => [{ ...c, my_booking: false }, ...prev].sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())); setShowCreate(false); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {classes.length === 0 ? (
        <EmptyState
          icon={<Calendar size={40} />}
          title="No upcoming classes"
          description={isCreator ? 'Schedule a class for your community.' : 'Classes will appear here once scheduled.'}
          action={isCreator ? <Button onClick={() => setShowCreate(true)}><Plus size={14} className="mr-2" /> Create class</Button> : undefined}
        />
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="p-5 border-gray-100 hover:border-gray-200 transition-colors">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{cls.title}</h3>
                    {cls.program && (
                      <Badge variant="default">{cls.program.name}</Badge>
                    )}
                  </div>
                  {cls.description && <p className="text-sm text-gray-500 mb-3">{cls.description}</p>}
                  <div className="flex items-center gap-6 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} /> {formatDateTime(cls.date_time)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} /> {cls.duration_minutes}min
                    </span>
                    <span className="flex items-center gap-1.5">
                      {cls.location_type === 'zoom' ? <Video size={14} /> : <MapPin size={14} />}
                      {cls.location_type === 'zoom' ? 'Online' : cls.location_value}
                    </span>
                    <span className="text-gray-400 font-normal">{cls.booking_count} booked</span>
                  </div>
                </div>
                {!isCreator && (
                  cls.my_booking ? (
                    <Button variant="secondary" size="sm" onClick={() => handleCancel(cls.id)}>
                      <Check size={14} className="text-green-600 mr-1.5" /> Booked
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleBook(cls.id)}>Book</Button>
                  )
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function CreateClassForm({ communityId, onCreated, onCancel }: {
  communityId: string;
  onCreated: (c: Class) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: '', description: '', date_time: '', duration_minutes: 60,
    location_type: 'zoom' as 'zoom' | 'physical', location_value: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('classes').insert({
      community_id: communityId,
      title: form.title,
      description: form.description || null,
      date_time: new Date(form.date_time).toISOString(),
      duration_minutes: form.duration_minutes,
      location_type: form.location_type,
      location_value: form.location_value,
    }).select('*').single();
    if (data && !error) onCreated({ ...data, booking_count: 0 });
    setLoading(false);
  }

  return (
    <Card className="p-6 mb-8 border-gray-200 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">New Class</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-black transition-colors"><X size={20} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Date & time" type="datetime-local" value={form.date_time} onChange={(e) => setForm({ ...form, date_time: e.target.value })} required />
          <Input label="Duration (min)" type="number" min="1" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} required />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Location</label>
          <div className="flex gap-3 mb-3">
            <button type="button" onClick={() => setForm({ ...form, location_type: 'zoom' })} className={cn('px-4 py-2 rounded-lg text-xs font-medium border transition-all', form.location_type === 'zoom' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')}>
              <Video size={14} className="inline mr-2" /> Online
            </button>
            <button type="button" onClick={() => setForm({ ...form, location_type: 'physical' })} className={cn('px-4 py-2 rounded-lg text-xs font-medium border transition-all', form.location_type === 'physical' ? 'border-black bg-black text-white' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50')}>
              <MapPin size={14} className="inline mr-2" /> In-person
            </button>
          </div>
          <Input
            value={form.location_value}
            onChange={(e) => setForm({ ...form, location_value: e.target.value })}
            placeholder={form.location_type === 'zoom' ? 'Zoom link' : 'Address'}
            required
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={loading}>Create class</Button>
        </div>
      </form>
    </Card>
  );
}
