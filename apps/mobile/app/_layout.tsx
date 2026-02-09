import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth';
import { initPurchases } from '../lib/purchases';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

export default function RootLayout() {
  const { setProfile, setCommunityId, setLoading, clear } = useAuthStore();

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setProfile(profile);

          // Initialize RevenueCat with the user's Supabase ID
          await initPurchases(session.user.id);

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
      setLoading(false);
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') clear();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
