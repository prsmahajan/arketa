'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Card, Button, Input, Spinner, Badge } from '@/components/ui';
import { Search, Smartphone } from 'lucide-react';

export default function JoinPage() {
  const router = useRouter();
  const { profile, setCommunityId, isLoading } = useAuthStore();
  const [slug, setSlug] = useState('');
  const [community, setCommunity] = useState<any>(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const [searching, setSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim()) return;
    setError('');
    setSearching(true);
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from('communities')
      .select('*, creator:profiles!communities_creator_id_fkey(name)')
      .eq('slug', slug.trim().toLowerCase())
      .single();

    if (err || !data) {
      setError('Community not found. Check the invite link or slug.');
      setCommunity(null);
    } else {
      setCommunity(data);
    }
    setSearching(false);
  }

  async function handleJoin() {
    if (!profile || !community) return;

    // If it's a paid community, redirect to mobile
    if (community.membership_entitlement_id) {
      alert('This community requires a paid membership. Please use the Aghor mobile app (iOS/Android) to subscribe and join.');
      return;
    }

    setJoining(true);
    const supabase = createClient();
    await supabase.from('memberships').insert({
      user_id: profile.id,
      community_id: community.id,
    });
    setCommunityId(community.id);
    router.push('/');
  }

  if (isLoading) return <Spinner />;

  // If user is a creator, redirect to home (they have a community)
  if (profile?.role === 'creator') {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Join a Community</h1>
          <p className="text-sm text-gray-500 mt-1">Enter the community slug to find and join</p>
        </div>

        <Card className="p-6 border-gray-200 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              label="Community slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. sarah-wellness"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" loading={searching}>
              <Search size={14} className="mr-2" /> Find community
            </Button>
          </form>

          {community && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-900">{community.name}</h3>
              <p className="text-sm text-gray-500">by {community.creator?.name}</p>
              {community.description && (
                <p className="text-sm text-gray-600 mt-2">{community.description}</p>
              )}
              {community.membership_entitlement_id && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Smartphone size={14} className="text-gray-500" />
                  <p className="text-xs text-gray-600 font-medium">
                    Paid membership — subscribe via mobile app
                  </p>
                </div>
              )}
              <Button onClick={handleJoin} loading={joining} className="w-full mt-4">
                {community.membership_entitlement_id ? 'Subscribe via mobile app' : 'Join community'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
