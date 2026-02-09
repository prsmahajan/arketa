'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Card, Spinner, Avatar, Badge, Button, Textarea } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Calendar, BookOpen, Flame, FileText } from 'lucide-react';
import { PageLayout } from '@/components/page-layout';

export default function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { profile, communityId } = useAuthStore();
  const [member, setMember] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isCreator = profile?.role === 'creator';

  useEffect(() => {
    if (!profile || !communityId) return;

    async function load() {
      const supabase = createClient();

      // Profile
      const { data: memberData } = await supabase.from('profiles').select('*').eq('id', id).single();
      setMember(memberData);

      // Enrollment
      const { data: enrollData } = await supabase
        .from('program_members')
        .select('*, program:programs(name, start_date, end_date)')
        .eq('user_id', id);
      setEnrollments(enrollData || []);

      // Streak
      const { data: streakData } = await supabase.from('engagement_streaks').select('*').eq('user_id', id).eq('community_id', communityId).single();
      setStreak(streakData);

      // Attendance
      const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', id).eq('status', 'confirmed');
      setAttendanceCount(count || 0);

      // Creator notes
      if (isCreator) {
        const { data: noteData } = await supabase.from('member_notes').select('content').eq('creator_id', profile!.id).eq('member_id', id).eq('community_id', communityId).single();
        setNote(noteData?.content || '');
      }

      setLoading(false);
    }

    load();
  }, [id, profile, communityId, isCreator]);

  async function saveNote() {
    if (!profile || !communityId) return;
    setNoteSaving(true);
    const supabase = createClient();
    await supabase.from('member_notes').upsert({
      creator_id: profile.id,
      member_id: id,
      community_id: communityId,
      content: note,
    }, { onConflict: 'creator_id,member_id,community_id' });
    setNoteSaving(false);
  }

  if (loading) return <Spinner />;
  if (!member) return null;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={14} /> Back
        </button>

        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <Avatar name={member.name} url={member.avatar_url} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">{member.name}</h1>
              <p className="text-sm text-gray-500">Joined {formatDate(member.created_at)}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <BookOpen size={16} className="mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-900">{enrollments.length}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Programs</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Calendar size={16} className="mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-900">{attendanceCount}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Classes</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
              <Flame size={16} className="mx-auto text-orange-500 mb-1" />
              <p className="text-lg font-bold text-gray-900">{streak?.current_streak || 0}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Streak</p>
            </div>
          </div>
        </Card>

        {/* Enrollments */}
        {enrollments.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Program Enrollments</h3>
            <div className="space-y-2">
              {enrollments.map((e: any) => (
                <div key={e.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">{e.program?.name}</span>
                  <Badge variant={e.status === 'active' ? 'success' : 'default'}>{e.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Creator Notes */}
        {isCreator && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-gray-400" />
              <h3 className="font-semibold text-gray-900">Private Notes</h3>
              <span className="text-[10px] text-gray-400">Only visible to you</span>
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add private notes about this member..."
              rows={4}
            />
            <div className="flex justify-end mt-2">
              <Button size="sm" onClick={saveNote} loading={noteSaving} variant="secondary">
                Save note
              </Button>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
