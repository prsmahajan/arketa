import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth';
import {
  getOfferings,
  purchasePackage,
  enrollAfterPurchase,
  hasEntitlement,
} from '../lib/purchases';
import type { PurchasesPackage } from 'react-native-purchases';

export default function JoinScreen() {
  const router = useRouter();
  const { profile, setCommunityId } = useAuthStore();
  const [slug, setSlug] = useState('');
  const [community, setCommunity] = useState<any>(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);

  async function handleSearch() {
    if (!slug.trim()) return;
    setError('');
    setSearching(true);
    const { data } = await supabase
      .from('communities')
      .select('*, creator:profiles!communities_creator_id_fkey(name)')
      .eq('slug', slug.trim().toLowerCase())
      .single();
    if (data) setCommunity(data);
    else setError('Community not found');
    setSearching(false);
  }

  async function handleJoin() {
    if (!profile || !community) return;
    setJoining(true);

    try {
      // If community has a paid membership entitlement, process via RevenueCat
      if (community.membership_entitlement_id) {
        // Check if user already has this entitlement
        const alreadyHas = await hasEntitlement(community.membership_entitlement_id);

        if (!alreadyHas) {
          // Find the matching product in offerings
          const offerings = await getOfferings();
          if (!offerings?.current) {
            Alert.alert('Error', 'Unable to load membership options.');
            setJoining(false);
            return;
          }

          let targetPackage: PurchasesPackage | undefined;
          for (const offering of Object.values(offerings.all)) {
            const pkg = offering.availablePackages.find(
              (p) => p.product.identifier === community.membership_entitlement_id,
            );
            if (pkg) { targetPackage = pkg; break; }
          }

          if (!targetPackage) {
            Alert.alert('Error', 'Membership product not available.');
            setJoining(false);
            return;
          }

          const customerInfo = await purchasePackage(targetPackage);
          if (!customerInfo) {
            // User cancelled
            setJoining(false);
            return;
          }
        }

        // Enroll locally for instant feedback (webhook will also handle it)
        await enrollAfterPurchase(profile.id, 'membership', community.id);
      } else {
        // Free community — join directly
        await supabase.from('memberships').insert({
          user_id: profile.id,
          community_id: community.id,
        });
      }

      setCommunityId(community.id);
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to join community.');
    }

    setJoining(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.container}>
        <Text style={s.title}>Join a Community</Text>
        <Text style={s.subtitle}>Enter the community slug</Text>

        <TextInput
          style={s.input}
          placeholder="e.g. sarah-wellness"
          value={slug}
          onChangeText={setSlug}
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />
        {error ? <Text style={s.error}>{error}</Text> : null}
        <TouchableOpacity style={s.btn} onPress={handleSearch} disabled={searching}>
          <Text style={s.btnText}>{searching ? 'Searching...' : 'Find community'}</Text>
        </TouchableOpacity>

        {community && (
          <View style={s.result}>
            <Text style={s.resultName}>{community.name}</Text>
            <Text style={s.resultCreator}>by {community.creator?.name}</Text>
            {community.description && <Text style={s.resultDesc}>{community.description}</Text>}
            {community.membership_entitlement_id && (
              <View style={s.paidBadge}>
                <Text style={s.paidText}>Paid membership</Text>
              </View>
            )}
            <TouchableOpacity style={[s.btn, { marginTop: 16 }]} onPress={handleJoin} disabled={joining}>
              <Text style={s.btnText}>
                {joining ? 'Joining...' : community.membership_entitlement_id ? 'Subscribe & Join' : 'Join community'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#111', backgroundColor: '#fafafa' },
  btn: { backgroundColor: '#059669', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 8, textAlign: 'center' },
  result: { marginTop: 24, backgroundColor: '#f9fafb', borderRadius: 16, padding: 16 },
  resultName: { fontSize: 18, fontWeight: '700', color: '#111' },
  resultCreator: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  resultDesc: { fontSize: 14, color: '#374151', marginTop: 8 },
  paidBadge: { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10, alignSelf: 'flex-start' },
  paidText: { color: '#92400e', fontSize: 12, fontWeight: '600' },
});
