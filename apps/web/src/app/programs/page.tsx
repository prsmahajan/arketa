'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Card, Button, Spinner, EmptyState, Badge, Input, Textarea } from '@/components/ui';
import { GridSkeleton } from '@/components/dashboard/skeletons';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { BookOpen, Users, Calendar, Plus, X } from 'lucide-react';
import type { Program } from '@aghor/shared';

import { PageLayout } from '@/components/page-layout';

export default function ProgramsPage() {
  const router = useRouter();
  // ... existing code ...

  if (isLoading || loading) return <GridSkeleton />;

  const isCreator = profile?.role === 'creator';

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-8">
        {/* ... existing content ... */}
      </div>

      {showCreate && (
        <CreateProgramForm
          communityId={communityId!}
          onCreated={(p) => { setPrograms((prev) => [p, ...prev]); setShowCreate(false); }}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {programs.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={40} />}
          title="No programs yet"
          description={isCreator ? 'Create your first program to start engaging your community.' : 'Programs will appear here once the creator adds them.'}
          action={isCreator ? <Button onClick={() => setShowCreate(true)}><Plus size={14} className="mr-2" /> Create program</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function ProgramCard({ program }: { program: Program }) {
  const isActive = new Date(program.end_date) >= new Date();

  return (
    <Link href={`/programs/${program.id}`}>
      <Card className="p-5 hover:shadow-md transition-all cursor-pointer h-full border-gray-100">
        {program.image_url && (
          <img src={program.image_url} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />
        )}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-tight text-lg">{program.name}</h3>
          <Badge variant={isActive ? 'success' : 'default'}>
            {isActive ? 'ACTIVE' : 'ENDED'}
          </Badge>
        </div>
        {program.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">{program.description}</p>
        )}
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(program.start_date)}</span>
          <span className="flex items-center gap-1.5"><Users size={14} /> {program.member_count || 0} enrolled</span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatCurrency(program.price_cents)}</span>
          <span className="text-xs text-gray-400 font-medium uppercase">One-time</span>
        </div>
      </Card>
    </Link>
  );
}

function CreateProgramForm({ communityId, onCreated, onCancel }: {
  communityId: string;
  onCreated: (p: Program) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: '', description: '', start_date: '', end_date: '',
    price_cents: 0, capacity: '', visibility: 'public' as const,
    rc_product_id: '',
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('programs').insert({
      community_id: communityId,
      name: form.name,
      description: form.description || null,
      start_date: form.start_date,
      end_date: form.end_date,
      price_cents: Math.round(form.price_cents * 100),
      capacity: form.capacity ? parseInt(form.capacity) : null,
      visibility: form.visibility,
      rc_product_id: form.rc_product_id || null,
    }).select('*').single();
    if (data && !error) onCreated({ ...data, member_count: 0 });
    setLoading(false);
  }

  return (
    <Card className="p-6 mb-8 border-gray-200 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 text-lg">New Program</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-black transition-colors"><X size={20} /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Program name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          <Input label="End date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Price (₹)" type="number" step="0.01" min="0" value={form.price_cents || ''} onChange={(e) => setForm({ ...form, price_cents: parseFloat(e.target.value) || 0 })} required />
          <Input label="Capacity (optional)" type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="Unlimited" />
        </div>
        <Input
          label="RevenueCat Product ID (optional)"
          value={form.rc_product_id}
          onChange={(e) => setForm({ ...form, rc_product_id: e.target.value })}
          placeholder="e.g. program_mindfulness_8wk"
        />
        <p className="text-xs text-gray-500 -mt-1">
          Set this to the product ID configured in RevenueCat. Members will purchase via the mobile app.
          Leave empty for free programs.
        </p>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
          <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={loading}>Create program</Button>
        </div>
      </form>
    </Card>
  );
}
