import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';
import { getInitials, formatDate } from '../../lib/utils';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, communityId, clear } = useAuthStore();
  const [streak, setStreak] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendanceCount, setAttendanceCount] = useState(0);

  useEffect(() => {
    if (!profile || !communityId) return;
    async function load() {
      const { data: s } = await supabase.from('engagement_streaks').select('*').eq('user_id', profile!.id).eq('community_id', communityId!).single();
      setStreak(s);

      const { data: e } = await supabase.from('program_members').select('*, program:programs(name)').eq('user_id', profile!.id).eq('status', 'active');
      setEnrollments(e || []);

      const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', profile!.id).eq('status', 'confirmed');
      setAttendanceCount(count || 0);
    }
    load();
  }, [profile, communityId]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    clear();
    router.replace('/login');
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{getInitials(profile.name)}</Text>
          </View>
          <Text style={s.name}>{profile.name}</Text>
          <Text style={s.role}>{profile.role === 'creator' ? 'Creator' : 'Member'}</Text>
          <Text style={s.joined}>Joined {formatDate(profile.created_at)}</Text>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>{enrollments.length}</Text>
            <Text style={s.statLabel}>Programs</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>{attendanceCount}</Text>
            <Text style={s.statLabel}>Classes</Text>
          </View>
          <View style={s.statCard}>
            <Text style={[s.statValue, { color: '#f97316' }]}>{streak?.current_streak || 0}🔥</Text>
            <Text style={s.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Enrollments */}
        {enrollments.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Active Programs</Text>
            {enrollments.map((e: any) => (
              <View key={e.id} style={s.enrollItem}>
                <Text style={s.enrollName}>{e.program?.name}</Text>
                <Text style={s.enrollDate}>Since {formatDate(e.enrolled_at)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Sign Out */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut}>
          <Text style={s.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { color: '#059669', fontSize: 22, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: '#111' },
  role: { fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 2 },
  joined: { fontSize: 12, color: '#9ca3af', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111' },
  statLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 10 },
  enrollItem: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  enrollName: { fontSize: 14, fontWeight: '600', color: '#111' },
  enrollDate: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  signOutBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  signOutText: { color: '#dc2626', fontSize: 15, fontWeight: '600' },
});
