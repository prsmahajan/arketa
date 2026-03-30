'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuthStore } from '@/lib/auth';
import { Card, Button, Spinner, Avatar, Badge, Textarea, EmptyState, Input } from '@/components/ui';
import { formatDate, formatCurrency, timeAgo } from '@/lib/utils';
import { Users, Calendar, ArrowLeft, Send, Heart, MessageCircle, Zap, Smartphone } from 'lucide-react';
import type { Program, WeeklyPrompt } from '@aghor/shared';

import { PageLayout } from '@/components/page-layout';

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // ... existing code ...

  if (loading) return <Spinner />;
  if (!program) return null;

  const isCreator = profile?.role === 'creator';
  const isFree = !program.price_cents || program.price_cents === 0;
  const isPaidWithRC = program.price_cents > 0 && program.rc_product_id;

  return (
    <PageLayout>
      {/* Header */}
      <button onClick={() => router.push('/programs')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={14} /> Back to programs
      </button>

      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{program.name}</h1>
            {program.description && <p className="text-sm text-gray-500 mt-2 max-w-2xl">{program.description}</p>}
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(program.start_date)} - {formatDate(program.end_date)}</span>
              <span className="flex items-center gap-1"><Users size={14} /> {memberCount} enrolled{program.capacity ? ` / ${program.capacity} spots` : ''}</span>
              <span className="font-semibold text-gray-900">{isFree ? 'Free' : formatCurrency(program.price_cents)}</span>
            </div>
          </div>
          {!isCreator && !isEnrolled && (
            <div className="flex flex-col items-end gap-2">
              <Button onClick={handleEnroll} loading={enrolling}>
                {isFree ? 'Enroll (Free)' : `Enroll ${formatCurrency(program.price_cents)}`}
              </Button>
              {isPaidWithRC && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Smartphone size={12} /> Purchase via mobile app
                </span>
              )}
            </div>
          )}
          {isEnrolled && <Badge variant="success">Enrolled</Badge>}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Program Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Program Feed</h2>

          {(isEnrolled || isCreator) && (
            <Card className="p-4">
              <Textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share with the program..."
                rows={2}
                className="border-0 p-0 focus:ring-0"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={handlePost} disabled={!newPost.trim()}>
                  <Send size={14} /> Post
                </Button>
              </div>
            </Card>
          )}

          {posts.length === 0 ? (
            <EmptyState
              icon={<MessageCircle size={36} />}
              title="No posts yet"
              description="Start a conversation in this program's feed."
            />
          ) : (
            posts.map((post: any) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <Avatar name={post.author_name} url={post.author_avatar} size="sm" />
                  <div>
                    <span className="text-sm font-semibold">{post.author_name}</span>
                    <span className="text-xs text-gray-400 ml-2">{timeAgo(post.created_at)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Heart size={12} /> {post.like_count}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} /> {post.comment_count}</span>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Sidebar: Weekly Prompts */}
        <aside className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Weekly Prompts</h3>
          {prompts.length === 0 ? (
            <p className="text-sm text-gray-400">No prompts yet.</p>
          ) : (
            prompts.map((prompt) => (
              <Card key={prompt.id} className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Zap size={12} className="text-amber-500" />
                  <span className="text-xs font-semibold text-gray-500">Week {prompt.week_number}</span>
                </div>
                <p className="text-sm text-gray-700">{prompt.content}</p>
              </Card>
            ))
          )}
        </aside>
      </div>
    </PageLayout>
  );
}
