import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';
import { formatDate, formatCurrency } from '../../lib/utils';
import {
  getOfferings,
  purchasePackage,
  enrollAfterPurchase,
  restorePurchases,
} from '../../lib/purchases';
import type { PurchasesPackage } from 'react-native-purchases';

export default function ProgramsScreen() {
  const { profile, communityId } = useAuthStore();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!communityId || !profile) return;
    async function load() {
      const { data } = await supabase
        .from('programs')
        .select('*, member_count:program_members(count)')
        .eq('community_id', communityId)
        .order('start_date', { ascending: false });

      // Check which programs user is already enrolled in
      const { data: myEnrollments } = await supabase
        .from('program_members')
        .select('program_id')
        .eq('user_id', profile!.id)
        .eq('status', 'active');

      const enrolledIds = new Set((myEnrollments || []).map((e: any) => e.program_id));

      setPrograms(
        (data || []).map((p: any) => ({
          ...p,
          member_count: p.member_count?.[0]?.count || 0,
          enrolled: enrolledIds.has(p.id),
        })),
      );
      setLoading(false);
    }
    load();
  }, [communityId, profile]);

  async function handleEnroll(program: any) {
    if (!profile) return;

    // If the program is free (price_cents === 0), enroll directly
    if (!program.price_cents || program.price_cents === 0) {
      await supabase.from('program_members').insert({
        user_id: profile.id,
        program_id: program.id,
      });
      setPrograms((prev) =>
        prev.map((p) => p.id === program.id ? { ...p, member_count: p.member_count + 1, enrolled: true } : p),
      );
      return;
    }

    // Paid program — use RevenueCat
    if (!program.rc_product_id) {
      Alert.alert('Not available', 'This program is not yet available for purchase.');
      return;
    }

    setPurchasing(program.id);
    try {
      const offerings = await getOfferings();
      if (!offerings?.current) {
        Alert.alert('Error', 'Unable to load purchase options. Try again later.');
        setPurchasing(null);
        return;
      }

      // Find the package matching this program's RC product
      let targetPackage: PurchasesPackage | undefined;
      for (const offering of Object.values(offerings.all)) {
        const pkg = offering.availablePackages.find(
          (p) => p.product.identifier === program.rc_product_id,
        );
        if (pkg) { targetPackage = pkg; break; }
      }

      if (!targetPackage) {
        Alert.alert('Error', 'Product not found. Contact the creator.');
        setPurchasing(null);
        return;
      }

      const customerInfo = await purchasePackage(targetPackage);
      if (customerInfo) {
        // Purchase succeeded — enroll locally for instant feedback
        // (The RevenueCat webhook will also do this, but this is instant)
        await enrollAfterPurchase(profile.id, 'program', program.id);
        setPrograms((prev) =>
          prev.map((p) => p.id === program.id ? { ...p, member_count: p.member_count + 1, enrolled: true } : p),
        );
      }
    } catch (err: any) {
      Alert.alert('Purchase failed', err.message || 'Something went wrong.');
    }
    setPurchasing(null);
  }

  async function handleRestore() {
    const info = await restorePurchases();
    if (info) {
      Alert.alert('Restored', 'Your purchases have been restored.');
    }
  }

  const renderProgram = ({ item }: { item: any }) => {
    const isActive = new Date(item.end_date) >= new Date();
    const isFree = !item.price_cents || item.price_cents === 0;
    return (
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Text style={s.cardTitle}>{item.name}</Text>
          <View style={[s.badge, isActive ? s.badgeActive : s.badgeEnded]}>
            <Text style={[s.badgeText, isActive ? s.badgeTextActive : s.badgeTextEnded]}>
              {isActive ? 'Active' : 'Ended'}
            </Text>
          </View>
        </View>
        {item.description && <Text style={s.desc} numberOfLines={2}>{item.description}</Text>}
        <View style={s.meta}>
          <Text style={s.metaText}>{formatDate(item.start_date)} – {formatDate(item.end_date)}</Text>
          <Text style={s.metaText}>{item.member_count} enrolled</Text>
        </View>
        <View style={s.cardFooter}>
          <Text style={s.price}>{isFree ? 'Free' : formatCurrency(item.price_cents)}</Text>
          {!item.enrolled && profile?.role === 'member' && (
            <TouchableOpacity
              style={[s.enrollBtn, purchasing === item.id && s.enrollBtnDisabled]}
              onPress={() => handleEnroll(item)}
              disabled={purchasing === item.id}
            >
              <Text style={s.enrollBtnText}>
                {purchasing === item.id ? 'Processing...' : 'Enroll'}
              </Text>
            </TouchableOpacity>
          )}
          {item.enrolled && (
            <View style={s.enrolledBadge}>
              <Text style={s.enrolledText}>Enrolled</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Programs</Text>
        <TouchableOpacity onPress={handleRestore}>
          <Text style={s.restoreText}>Restore purchases</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={programs}
        keyExtractor={(item) => item.id}
        renderItem={renderProgram}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No programs yet</Text>
              <Text style={s.emptyDesc}>Programs will appear here</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  restoreText: { fontSize: 12, color: '#059669', fontWeight: '500' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeActive: { backgroundColor: '#ecfdf5' },
  badgeEnded: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextActive: { color: '#059669' },
  badgeTextEnded: { color: '#6b7280' },
  desc: { fontSize: 13, color: '#6b7280', marginTop: 6, lineHeight: 18 },
  meta: { flexDirection: 'row', gap: 16, marginTop: 10 },
  metaText: { fontSize: 12, color: '#9ca3af' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#f3f4f6' },
  price: { fontSize: 18, fontWeight: '700', color: '#059669' },
  enrollBtn: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 20 },
  enrollBtnDisabled: { opacity: 0.6 },
  enrollBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  enrolledBadge: { backgroundColor: '#ecfdf5', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14 },
  enrolledText: { color: '#059669', fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
