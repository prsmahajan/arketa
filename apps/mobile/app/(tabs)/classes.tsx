import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';

export default function ClassesScreen() {
  const { profile, communityId } = useAuthStore();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!communityId || !profile) return;
    async function load() {
      const { data } = await supabase
        .from('classes')
        .select('*, program:programs(name), booking_count:bookings(count)')
        .eq('community_id', communityId)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true });

      const { data: myBookings } = await supabase
        .from('bookings')
        .select('class_id')
        .eq('user_id', profile!.id)
        .eq('status', 'confirmed');

      const bookedIds = new Set((myBookings || []).map((b: any) => b.class_id));

      setClasses(
        (data || []).map((c: any) => ({
          ...c,
          booking_count: c.booking_count?.[0]?.count || 0,
          is_booked: bookedIds.has(c.id),
        })),
      );
      setLoading(false);
    }
    load();
  }, [communityId, profile]);

  async function handleBook(classId: string) {
    if (!profile) return;
    await supabase.from('bookings').insert({ user_id: profile.id, class_id: classId });
    setClasses((prev) => prev.map((c) => c.id === classId ? { ...c, is_booked: true, booking_count: c.booking_count + 1 } : c));
  }

  async function handleCancel(classId: string) {
    if (!profile) return;
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('user_id', profile.id).eq('class_id', classId);
    setClasses((prev) => prev.map((c) => c.id === classId ? { ...c, is_booked: false, booking_count: Math.max(0, c.booking_count - 1) } : c));
  }

  const renderClass = ({ item }: { item: any }) => {
    const dt = new Date(item.date_time);
    return (
      <View style={s.card}>
        <View style={s.dateCol}>
          <Text style={s.dateMonth}>{dt.toLocaleDateString('en-US', { month: 'short' })}</Text>
          <Text style={s.dateDay}>{dt.getDate()}</Text>
          <Text style={s.dateTime}>{dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
        </View>
        <View style={s.info}>
          <Text style={s.title}>{item.title}</Text>
          <Text style={s.detail}>{item.duration_minutes}min · {item.location_type === 'zoom' ? '📹 Online' : '📍 ' + item.location_value}</Text>
          {item.program?.name && <Text style={s.program}>{item.program.name}</Text>}
          <Text style={s.booked}>{item.booking_count} booked</Text>
        </View>
        <View>
          {item.is_booked ? (
            <TouchableOpacity style={s.cancelBtn} onPress={() => handleCancel(item.id)}>
              <Text style={s.cancelBtnText}>✓ Booked</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={s.bookBtn} onPress={() => handleBook(item.id)}>
              <Text style={s.bookBtnText}>Book</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Classes</Text>
      </View>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        renderItem={renderClass}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListEmptyComponent={
          loading ? null : (
            <View style={s.empty}>
              <Text style={s.emptyTitle}>No upcoming classes</Text>
              <Text style={s.emptyDesc}>Classes will appear here</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  dateCol: { alignItems: 'center', width: 50 },
  dateMonth: { fontSize: 11, fontWeight: '600', color: '#059669', textTransform: 'uppercase' },
  dateDay: { fontSize: 22, fontWeight: '700', color: '#111' },
  dateTime: { fontSize: 10, color: '#9ca3af' },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#111' },
  detail: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  program: { fontSize: 11, color: '#059669', marginTop: 2 },
  booked: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  bookBtn: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 },
  bookBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#ecfdf5', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  cancelBtnText: { color: '#059669', fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
