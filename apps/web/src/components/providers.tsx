'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  const { setProfile, setCommunityId, setLoading } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setProfile(profile);
            // Get the community (either created or joined)
            if (profile.role === 'creator') {
              const { data: community } = await supabase
                .from('communities')
                .select('id')
                .eq('creator_id', profile.id)
                .single();
              if (community) setCommunityId(community.id);
            } else {
              const { data: membership } = await supabase
                .from('memberships')
                .select('community_id')
                .eq('user_id', profile.id)
                .eq('status', 'active')
                .limit(1)
                .single();
              if (membership) setCommunityId(membership.community_id);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setLoading(false);
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setCommunityId(null);
        setLoading(false);
        return;
      }
      if (event === 'SIGNED_IN' && session?.user) {
        setLoading(true);
        // Safety timeout: Force loading to false after 3 seconds if data fetching hangs
        const timeoutId = setTimeout(() => {
            console.warn('Auth loading timed out - forcing UI render');
            setLoading(false);
        }, 3000);

        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profile) {
            setProfile(profile);
            if (profile.role === 'creator') {
              const { data: community } = await supabase
                .from('communities')
                .select('id')
                .eq('creator_id', profile.id)
                .single();
              if (community) setCommunityId(community.id);
            } else {
              const { data: membership } = await supabase
                .from('memberships')
                .select('community_id')
                .eq('user_id', profile.id)
                .eq('status', 'active')
                .limit(1)
                .single();
              if (membership) setCommunityId(membership.community_id);
            }
          }
        } catch (error) {
          console.error('Auth state change failed:', error);
        } finally {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [setProfile, setCommunityId, setLoading]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
