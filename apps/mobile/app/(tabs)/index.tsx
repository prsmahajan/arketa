import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, SafeAreaView,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';
import { timeAgo, getInitials } from '../../lib/utils';

interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  author_role: string;
  comment_count: number;
  like_count: number;
  is_liked: boolean;
}

export default function FeedScreen() {
  const { profile, communityId } = useAuthStore();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPost, setNewPost] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);

  const loadFeed = useCallback(async () => {
    if (!communityId || !profile) return;
    const { data } = await supabase.rpc('get_community_feed', {
      p_community_id: communityId,
      p_user_id: profile.id,
      p_limit: 30,
      p_cursor: null,
    });
    setPosts((data || []) as FeedPost[]);
  }, [communityId, profile]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  }

  async function handlePost() {
    if (!newPost.trim() || !profile || !communityId) return;
    setPosting(true);
    const { data } = await supabase
      .from('posts')
      .insert({ author_id: profile.id, community_id: communityId, content: newPost.trim() })
      .select('*')
      .single();
    if (data) {
      setPosts((prev) => [{
        ...data,
        author_name: profile.name,
        author_avatar: profile.avatar_url,
        author_role: profile.role,
        comment_count: 0, like_count: 0, is_liked: false,
      }, ...prev]);
      setNewPost('');
    }
    setPosting(false);
  }

  async function handleLike(postId: string) {
    if (!profile) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    if (post.is_liked) {
      await supabase.from('likes').delete().eq('user_id', profile.id).eq('post_id', postId);
    } else {
      await supabase.from('likes').insert({ user_id: profile.id, post_id: postId });
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 } : p,
      ),
    );
  }

  const renderPost = ({ item }: { item: FeedPost }) => (
    <View style={s.postCard}>
      <View style={s.postHeader}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{getInitials(item.author_name)}</Text>
        </View>
        <View>
          <Text style={s.authorName}>{item.author_name}</Text>
          <Text style={s.postTime}>{timeAgo(item.created_at)}</Text>
        </View>
      </View>
      <Text style={s.postContent}>{item.content}</Text>
      <View style={s.postActions}>
        <TouchableOpacity onPress={() => handleLike(item.id)} style={s.actionBtn}>
          <Text style={[s.actionText, item.is_liked && { color: '#e11d48' }]}>
            {item.is_liked ? '♥' : '♡'} {item.like_count > 0 ? item.like_count : ''}
          </Text>
        </TouchableOpacity>
        <View style={s.actionBtn}>
          <Text style={s.actionText}>💬 {item.comment_count > 0 ? item.comment_count : ''}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Community</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#059669" />}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={s.composer}>
            <TextInput
              style={s.composerInput}
              placeholder="Share something..."
              value={newPost}
              onChangeText={setNewPost}
              multiline
              placeholderTextColor="#9ca3af"
            />
            {newPost.trim() ? (
              <TouchableOpacity style={s.postBtn} onPress={handlePost} disabled={posting}>
                <Text style={s.postBtnText}>{posting ? '...' : 'Post'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No posts yet</Text>
            <Text style={s.emptyDesc}>Be the first to share something</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fafafa' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#f3f4f6' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111' },
  composer: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  composerInput: { fontSize: 15, color: '#111', minHeight: 40, maxHeight: 100 },
  postBtn: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16, alignSelf: 'flex-end', marginTop: 8 },
  postBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  postCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#d1fae5', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#059669', fontSize: 12, fontWeight: '700' },
  authorName: { fontSize: 14, fontWeight: '600', color: '#111' },
  postTime: { fontSize: 11, color: '#9ca3af' },
  postContent: { fontSize: 15, color: '#374151', lineHeight: 22 },
  postActions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#f9fafb' },
  actionBtn: { paddingVertical: 2 },
  actionText: { fontSize: 14, color: '#9ca3af' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#9ca3af', marginTop: 4 },
});
