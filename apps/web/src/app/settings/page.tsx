'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Card, Button, Input, Textarea, Spinner } from '@/components/ui';
import { User, Settings2, Smartphone } from 'lucide-react';
import { PageLayout } from '@/components/page-layout';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, communityId, isLoading, setProfile } = useAuthStore();
  const [community, setCommunity] = useState<any>(null);
  const [name, setName] = useState('');
  const [commName, setCommName] = useState('');
  const [commDesc, setCommDesc] = useState('');
  const [membershipEntitlementId, setMembershipEntitlementId] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isCreator = profile?.role === 'creator';

  useEffect(() => {
    if (isLoading) return;
    if (!profile) { router.push('/auth'); return; }

    setName(profile.name);

    if (isCreator && communityId) {
      const supabase = createClient();
      supabase.from('communities').select('*').eq('id', communityId).single().then(({ data }) => {
        if (data) {
          setCommunity(data);
          setCommName(data.name);
          setCommDesc(data.description || '');
          setMembershipEntitlementId(data.membership_entitlement_id || '');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isLoading, profile, communityId, isCreator, router]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();

    // Update profile name
    if (name !== profile.name) {
      await supabase.from('profiles').update({ name }).eq('id', profile.id);
      setProfile({ ...profile, name });
    }

    // Update community
    if (isCreator && communityId) {
      await supabase.from('communities').update({
        name: commName,
        description: commDesc || null,
        membership_entitlement_id: membershipEntitlementId || null,
      }).eq('id', communityId);
    }

    setSaving(false);
  }

  if (isLoading || loading) return <Spinner />;

  return (
    <PageLayout>
      <div className="max-w-lg">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Settings</h1>

        <Card className="p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-900">Profile</h2>
          </div>
          <Input label="Display name" value={name} onChange={(e) => setName(e.target.value)} />
        </Card>

        {isCreator && (
          <>
            <Card className="p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 size={16} className="text-gray-400" />
                <h2 className="font-semibold text-gray-900">Community Settings</h2>
              </div>
              <div className="space-y-3">
                <Input label="Community name" value={commName} onChange={(e) => setCommName(e.target.value)} />
                <Textarea label="Description" value={commDesc} onChange={(e) => setCommDesc(e.target.value)} rows={3} />
              </div>
            </Card>

            <Card className="p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <Smartphone size={16} className="text-gray-400" />
                <h2 className="font-semibold text-gray-900">RevenueCat / In-App Purchases</h2>
              </div>
              <div className="space-y-3">
                <Input
                  label="Membership Entitlement ID"
                  value={membershipEntitlementId}
                  onChange={(e) => setMembershipEntitlementId(e.target.value)}
                  placeholder="e.g. community_membership"
                />
                <p className="text-xs text-gray-400">
                  Set this to the RevenueCat product/entitlement ID for your community membership.
                  Members will purchase this via the iOS/Android app. Leave empty for free communities.
                </p>
              </div>
            </Card>
          </>
        )}

        <Button onClick={handleSave} loading={saving} className="w-full">
          Save changes
        </Button>
      </div>
    </PageLayout>
  );
}
