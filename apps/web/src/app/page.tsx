'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Card, Button, Textarea, Avatar, Spinner, EmptyState, Badge } from '@/components/ui';
import { timeAgo } from '@/lib/utils';
import { Heart, MessageCircle, Trash2, Send, Flame, ChevronDown } from 'lucide-react';
import type { Post } from '@arketa/shared';
import { PageLayout } from '@/components/page-layout';

interface FeedPost extends Post {
  author_name: string;
  author_avatar: string | null;
  author_role: string;
  comment_count: number;
  like_count: number;
  is_liked: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const { profile, communityId, isLoading: authLoading } = useAuthStore();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [community, setCommunity] = useState<any>(null);
  const [streak, setStreak] = useState<any>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadFeed = useCallback(async (cursor?: string) => {
    if (!communityId || !profile) return;
    const supabase = createClient();

    const { data } = await supabase.rpc('get_community_feed', {
      p_community_id: communityId,
      p_user_id: profile.id,
      p_limit: 21,
      p_cursor: cursor || null,
    });

    const items = (data || []) as FeedPost[];
    setHasMore(items.length > 20);
    return items.slice(0, 20);
  }, [communityId, profile]);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { router.push('/auth'); return; }
    if (!communityId) { router.push('/join'); return; }

    async function init() {
      const supabase = createClient();

      // Load community info
      const { data: comm } = await supabase.from('communities').select('*, creator:profiles!communities_creator_id_fkey(name)').eq('id', communityId).single();
      setCommunity(comm);

      // Load streak
      const { data: s } = await supabase.from('engagement_streaks').select('*').eq('user_id', profile!.id).eq('community_id', communityId!).single();
      setStreak(s);

      // Load feed
      const items = await loadFeed();
      setPosts(items || []);
      setLoading(false);
    }

    init();
  }, [authLoading, profile, communityId, router, loadFeed]);

  async function handlePost() {
    if (!newPost.trim() || !communityId || !profile) return;
    setPosting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('posts')
      .insert({ author_id: profile.id, community_id: communityId, content: newPost.trim() })
      .select('*')
      .single();

    if (data && !error) {
      const feedPost: FeedPost = {
        ...data,
        author_name: profile.name,
        author_avatar: profile.avatar_url,
        author_role: profile.role,
        comment_count: 0,
        like_count: 0,
        is_liked: false,
      };
      setPosts((prev) => [feedPost, ...prev]);
      setNewPost('');
      // Update streak
      await supabase.rpc('update_engagement_streak', { p_user_id: profile.id, p_community_id: communityId });
    }
    setPosting(false);
  }

  async function handleLike(postId: string) {
    if (!profile) return;
    const supabase = createClient();
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    if (post.is_liked) {
      await supabase.from('likes').delete().eq('user_id', profile.id).eq('post_id', postId);
    } else {
      await supabase.from('likes').insert({ user_id: profile.id, post_id: postId });
    }

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_liked: !p.is_liked, like_count: p.is_liked ? p.like_count - 1 : p.like_count + 1 }
          : p,
      ),
    );
  }

  async function handleDelete(postId: string) {
    const supabase = createClient();
    await supabase.from('posts').update({ deleted_at: new Date().toISOString() }).eq('id', postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  async function loadMore() {
    if (!posts.length) return;
    setLoadingMore(true);
    const lastPost = posts[posts.length - 1];
    const items = await loadFeed(lastPost.created_at);
    if (items) setPosts((prev) => [...prev, ...items]);
    setLoadingMore(false);
  }

  if (authLoading || loading) return <Spinner />;

  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main Feed */}
        <div className="space-y-6">
          {/* Community Header */}
          {community && (
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{community.name}</h1>
              {community.description && (
                <p className="text-sm text-gray-500 mt-1">{community.description}</p>
              )}
            </div>
          )}

          {/* Create Post */}
          <Card className="p-4">
            <div className="flex gap-4">
              <Avatar name={profile?.name || ''} url={profile?.avatar_url} />
              <div className="flex-1">
                <Textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share something with the community..."
                  rows={2}
                  className="border-0 p-0 focus:ring-0 resize-none text-sm bg-transparent"
                />
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-50">
                  <Button size="sm" onClick={handlePost} loading={posting} disabled={!newPost.trim()}>
                    <Send size={14} className="mr-2" /> Post
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Posts */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <EmptyState
                icon={<MessageCircle size={40} />}
                title="No posts yet"
                description="Be the first to share something with the community."
              />
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={profile?.id || ''}
                  isCreator={profile?.role === 'creator'}
                  onLike={() => handleLike(post.id)}
                  onDelete={() => handleDelete(post.id)}
                />
              ))
            )}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button variant="ghost" onClick={loadMore} loading={loadingMore}>
                <ChevronDown size={16} className="mr-2" /> Load more
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-6">
          {/* Streak */}
          {streak && streak.current_streak > 0 && (
            <Card className="p-5 border-orange-100 bg-orange-50/30">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={18} className="text-orange-500" />
                <span className="text-sm font-semibold text-gray-900">Activity Streak</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-500 mt-1">Best: {streak.longest_streak} days</p>
            </Card>
          )}

          {/* Quick Links */}
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick links</h3>
            <a href="/programs" className="block text-sm text-gray-600 hover:text-black transition-colors">Browse programs</a>
            <a href="/classes" className="block text-sm text-gray-600 hover:text-black transition-colors">Upcoming classes</a>
            {profile?.role === 'creator' && (
              <a href="/dashboard" className="block text-sm text-gray-600 hover:text-black transition-colors">Creator dashboard</a>
            )}
          </Card>
        </aside>
      </div>
    </PageLayout>
  );
}

// ─── Post Card Component ─────────────────────────────────────
function PostCard({
  post, currentUserId, isCreator, onLike, onDelete,
}: {
  post: FeedPost;
  currentUserId: string;
  isCreator: boolean;
  onLike: () => void;
  onDelete: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const canDelete = post.author_id === currentUserId || isCreator;

  async function loadComments() {
    if (comments.length > 0) { setShowComments(!showComments); return; }
    setLoadingComments(true);
    setShowComments(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .select('*, author:profiles!comments_author_id_fkey(name, avatar_url)')
      .eq('post_id', post.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    setComments(data || []);
    setLoadingComments(false);
  }

  async function handleComment() {
    if (!commentText.trim()) return;
    const supabase = createClient();
    const { data } = await supabase
      .from('comments')
      .insert({ author_id: currentUserId, post_id: post.id, content: commentText.trim() })
      .select('*, author:profiles!comments_author_id_fkey(name, avatar_url)')
      .single();
    if (data) {
      setComments((prev) => [...prev, data]);
      setCommentText('');
      post.comment_count += 1;
    }
  }

  return (
    <Card className="overflow-hidden border-gray-100 shadow-sm">
      <div className="p-5">
        {/* Author Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={post.author_name} url={post.author_avatar} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{post.author_name}</span>
                {post.author_role === 'creator' && (
                  <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.5 rounded">CREATOR</span>
                )}
              </div>
              <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
            </div>
          </div>
          {canDelete && (
            <button onClick={onDelete} className="text-gray-300 hover:text-red-500 transition-colors p-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Content */}
        <p className="mt-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img src={post.image_url} alt="" className="mt-4 rounded-lg w-full max-h-96 object-cover border border-gray-100" />
        )}

        {/* Actions */}
        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={onLike}
            className={`flex items-center gap-2 text-sm transition-colors ${
              post.is_liked ? 'text-red-500 font-medium' : 'text-gray-500 hover:text-black'
            }`}
          >
            <Heart size={18} fill={post.is_liked ? 'currentColor' : 'none'} className={post.is_liked ? 'text-red-500' : 'text-gray-400'} />
            {post.like_count > 0 ? post.like_count : 'Like'}
          </button>
          <button
            onClick={loadComments}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
          >
            <MessageCircle size={18} className="text-gray-400" />
            {post.comment_count > 0 ? `${post.comment_count} Comments` : 'Comment'}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 px-5 py-4 space-y-4 border-t border-gray-100">
          {loadingComments ? (
            <p className="text-xs text-gray-400 text-center py-2">Loading...</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar name={c.author?.name || ''} url={c.author?.avatar_url} size="sm" />
                <div className="bg-white p-3 rounded-r-xl rounded-bl-xl border border-gray-100 shadow-sm flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-900">{c.author?.name}</span>
                    <span className="text-xs text-gray-400">{timeAgo(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-700">{c.content}</p>
                </div>
              </div>
            ))
          )}
          {/* Add Comment */}
          <div className="flex gap-2 pt-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="Write a comment..."
              className="flex-1 text-sm bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all shadow-sm"
            />
            <Button size="sm" onClick={handleComment} disabled={!commentText.trim()} className="px-3">
              <Send size={14} />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
