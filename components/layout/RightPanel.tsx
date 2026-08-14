/* eslint-disable @next/next/no-img-element */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { WebNavigation } from '@/db/supabase/types';
import { ExternalLink, Star, Calendar, Tag, MousePointerClick, MessageSquare, User, Trophy, Medal } from 'lucide-react';
import ToolIcon from '@/components/layout/ToolIcon';
import BenchmarkPanel from './BenchmarkPanel';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
  tool_name: string;
}

interface RightPanelProps {
  selectedTool: WebNavigation | null;
  allTools: WebNavigation[];
}

// Weight constants matching BenchmarkPanel
const WEIGHTS: Record<string, number> = {
  swe_bench_verified: 0.30,
  terminal_bench: 0.25,
  swe_bench_pro: 0.20,
  aider_polyglot: 0.15,
  live_code_bench: 0.10,
};

interface BenchmarkScores {
  swe_bench_verified: number | null;
  terminal_bench: number | null;
  swe_bench_pro: number | null;
  aider_polyglot: number | null;
  live_code_bench: number | null;
}

function computeClipScore(benchmarks: BenchmarkScores): number | null {
  const keys = Object.keys(WEIGHTS) as Array<keyof BenchmarkScores>;
  const entries = keys
    .filter((k) => benchmarks[k] != null)
    .map((k) => ({ weight: WEIGHTS[k], score: benchmarks[k] as number }));

  if (entries.length === 0) return null;

  const totalWeight = entries.reduce((s, e) => s + e.weight, 0);
  const weightedSum = entries.reduce((s, e) => s + e.score * e.weight, 0);

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

function parseBenchmarks(websiteData: string): BenchmarkScores | null {
  try {
    const data = JSON.parse(websiteData);
    if (data?.benchmarks && typeof data.benchmarks === 'object') {
      return data.benchmarks as BenchmarkScores;
    }
    return null;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getScoreColor(rating: number): string {
  if (rating >= 8) return '#1a7a4c';
  if (rating >= 5) return '#135e6b';
  return '#7b869a';
}

function getPricingLabel(websiteData: string): string {
  try {
    const data = JSON.parse(websiteData);
    return data?.pricing || '';
  } catch {
    return '';
  }
}

function getPlatformLabel(websiteData: string): string {
  try {
    const data = JSON.parse(websiteData);
    return data?.platform || '';
  } catch {
    return '';
  }
}

export default function RightPanel({ selectedTool, allTools }: RightPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Compute ranking among all tools with benchmark data
  const ranking = useMemo(() => {
    if (!selectedTool) return null;

    const allScores = allTools
      .map((tool) => {
        const b = parseBenchmarks(tool.website_data || '{}');
        if (!b) return null;
        const score = computeClipScore(b);
        if (score == null) return null;
        return { name: tool.name, title: tool.title || tool.name, score };
      })
      .filter((x): x is { name: string; title: string; score: number } => x != null);

    // Sort descending by score
    allScores.sort((a, b) => b.score - a.score);

    const currentIdx = allScores.findIndex((t) => t.name === selectedTool.name);
    const total = allScores.length;

    if (currentIdx === -1 || total === 0) return null;

    return {
      rank: currentIdx + 1,
      total,
      topScore: allScores[0]?.score || 0,
      toolScore: allScores[currentIdx]?.score || 0,
    };
  }, [selectedTool, allTools]);

  useEffect(() => {
    if (selectedTool) {
      try {
        const stored = localStorage.getItem(`comments_${selectedTool.name}`);
        if (stored) {
          setComments(JSON.parse(stored));
        } else {
          setComments([]);
        }
      } catch {
        setComments([]);
      }
    } else {
      setComments([]);
    }
  }, [selectedTool]);

  const handleSubmitComment = useCallback(() => {
    if (!newComment.trim() || !selectedTool || submitting) return;

    setSubmitting(true);
    const comment: Comment = {
      id: Date.now(),
      author_name: authorName.trim() || 'Anonymous',
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      tool_name: selectedTool.name,
    };

    const updated = [comment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`comments_${selectedTool.name}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setNewComment('');
    setSubmitting(false);
  }, [newComment, authorName, selectedTool, comments, submitting]);

  // Empty state
  if (!selectedTool) {
    return (
      <div className='flex h-full flex-col items-center justify-center px-8 text-center'>
        <MousePointerClick className='size-10 text-[#d0d4da]' />
        <p className='mt-4 text-[13px] font-medium text-[#7b869a]'>Select a tool</p>
        <p className='mt-1 text-[12px] text-[#a0a8b4]'>Click any tool from the list<br />to view details here</p>
      </div>
    );
  }

  const pricing = getPricingLabel(selectedTool.website_data || '{}');
  const platform = getPlatformLabel(selectedTool.website_data || '{}');
  const benchmarks = parseBenchmarks(selectedTool.website_data || '{}');
  const tags = (selectedTool.tag_name || '').split(',').filter(Boolean);

  return (
    <div className='flex h-full flex-col'>
      {/* ====== Upper: Tool Details ====== */}
      <div className='shrink-0 border-b border-[#eef0f2] p-5'>
        {/* Thumbnail */}
        {selectedTool.thumbnail_url && (
          <div className='mb-4 overflow-hidden rounded-lg border border-[#eef0f2]'>
            <ToolIcon
              src={selectedTool.thumbnail_url}
              alt={selectedTool.title || ''}
              emoji='📦'
              websiteUrl={selectedTool.url}
              className='aspect-[16/9] w-full object-cover'
            />
          </div>
        )}

        <h2 className='text-[17px] font-bold leading-tight text-[#1c2733]'>{selectedTool.title}</h2>
        <p className='mt-1.5 text-[13px] leading-relaxed text-[#586574]'>{selectedTool.content}</p>

        {/* Meta row */}
        <div className='mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#7b869a]'>
          <span className='inline-flex items-center gap-1'>
            <Calendar className='size-3.5' />
            {formatDate(selectedTool.collection_time || '')}
          </span>
          <span className='text-[#d0d4da]'>|</span>
          <span className='inline-flex items-center gap-1'>
            <Tag className='size-3.5' />
            {selectedTool.category_name}
          </span>
          {pricing && (
            <>
              <span className='text-[#d0d4da]'>|</span>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold ${pricing.toLowerCase().includes('free') ? 'bg-[#e8f5e9] text-[#1a7a4c]' : 'bg-[#fef3e2] text-[#b85c00]'}`}>
                {pricing}
              </span>
            </>
          )}
          {platform && (
            <>
              <span className='text-[#d0d4da]'>|</span>
              <span className='inline-flex items-center rounded bg-[#f0f1f2] px-1.5 py-0.5 text-[11px] font-medium text-[#586574]'>
                {platform}
              </span>
            </>
          )}
        </div>

        {/* Score & Ranking combo */}
        <div className='mt-4 flex flex-wrap items-center gap-3'>
          {/* Star rating */}
          {selectedTool.star_rating != null && selectedTool.star_rating > 0 && (
            <div className='flex items-center gap-1.5 rounded-lg bg-[#e8f4f6] px-3 py-1.5'>
              <Star className='size-4' fill={getScoreColor(selectedTool.star_rating)} color={getScoreColor(selectedTool.star_rating)} />
              <span className='text-[14px] font-bold text-[#135e6b]'>{selectedTool.star_rating}</span>
              <span className='text-[12px] text-[#7b869a]'>/10</span>
            </div>
          )}

          {/* ClipScore badge */}
          {benchmarks && computeClipScore(benchmarks) != null && (
            <div className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#e8f4f6] to-[#f0f7f8] px-3 py-1.5'>
              <Trophy className='size-4 text-[#135e6b]' />
              <span className='text-[12px] font-medium text-[#7b869a]'>ClipScore</span>
              <span className='text-[14px] font-bold text-[#135e6b]'>{computeClipScore(benchmarks)}</span>
            </div>
          )}

          {/* Ranking badge */}
          {ranking && (
            <div className='flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#fef3e2] to-[#fef9f0] px-3 py-1.5'>
              <Medal className='size-4 text-[#b85c00]' />
              <span className='text-[12px] font-medium text-[#7b869a]'>Rank</span>
              <span className='text-[14px] font-bold text-[#b85c00]'>#{ranking.rank}</span>
              <span className='text-[11px] text-[#a0a8b4]'>/ {ranking.total}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-1.5'>
            {tags.map((tag) => (
              <span key={tag} className='rounded-full bg-[#f0f1f2] px-2 py-0.5 text-[11px] font-medium text-[#586574]'>{tag}</span>
            ))}
          </div>
        )}

        {/* Visit button */}
        <a
          href={selectedTool.url}
          target='_blank'
          rel='noreferrer nofollow'
          className='mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#135e6b] px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-[#0f4d58] active:scale-[0.98]'
        >
          <ExternalLink className='size-3.5' />
          Visit Website
        </a>
      </div>

      {/* ====== Benchmark Panel (for Agent tools) ====== */}
      {benchmarks && (
        <BenchmarkPanel
          benchmarks={benchmarks}
        />
      )}

      {/* ====== Lower: Comments ====== */}
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* --- Comment Form (评价栏) --- */}
        <div className='shrink-0 border-b border-[#eef0f2] px-5 py-4'>
          <div className='mb-3 flex items-center gap-2'>
            <MessageSquare className='size-4 text-[#135e6b]' />
            <span className='text-[14px] font-bold text-[#1c2733]'>Write a Review</span>
          </div>
          <div className='flex flex-col gap-2.5'>
            <div className='relative'>
              <User className='pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#b0b8c2]' />
              <input
                type='text'
                className='w-full rounded-lg border border-[#e2e4e7] py-2 pl-9 pr-3 text-[13px] text-[#1c2733] outline-none transition-all placeholder:text-[#b0b8c2] focus:border-[#135e6b] focus:shadow-[0_0_0_3px_rgba(19,94,107,0.1)]'
                placeholder='Your name (optional)'
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={50}
              />
            </div>
            <textarea
              className='min-h-[80px] w-full resize-y rounded-lg border border-[#e2e4e7] px-3 py-2.5 text-[13px] leading-relaxed text-[#1c2733] outline-none transition-all placeholder:text-[#b0b8c2] focus:border-[#135e6b] focus:shadow-[0_0_0_3px_rgba(19,94,107,0.1)]'
              placeholder='Share your experience with this tool — what do you like? What could be improved?'
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={500}
            />
            <div className='flex items-center justify-between'>
              <span className='text-[11px] text-[#b0b8c2]'>
                {newComment.length}/500
              </span>
              <button
                type='button'
                className='rounded-lg bg-[#135e6b] px-4 py-1.5 text-[13px] font-semibold text-white transition-all hover:bg-[#0f4d58] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40'
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
              >
                {submitting ? 'Posting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>

        {/* --- Comment List (历史评价) --- */}
        <div className='flex-1 overflow-y-auto'>
          <div className='sticky top-0 z-10 border-b border-[#eef0f2] bg-white px-5 py-2.5'>
            <div className='flex items-center gap-2'>
              <span className='text-[13px] font-bold text-[#1c2733]'>All Reviews</span>
              <span className='rounded-full bg-[#f0f1f2] px-2 py-0.5 text-[11px] font-semibold text-[#7b869a]'>{comments.length}</span>
            </div>
          </div>

          <div className='px-5 py-3'>
            {comments.map((comment) => (
              <div key={comment.id} className='border-b border-[#f5f6f7] py-3 last:border-b-0'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='flex size-6 items-center justify-center rounded-full bg-[#e8f4f6] text-[10px] font-bold text-[#135e6b]'>
                      {comment.author_name.charAt(0).toUpperCase()}
                    </div>
                    <span className='text-[13px] font-semibold text-[#1c2733]'>{comment.author_name}</span>
                  </div>
                  <span className='text-[11px] text-[#b0b8c2]'>{formatRelativeDate(comment.created_at)}</span>
                </div>
                <p className='mt-1.5 pl-8 text-[13px] leading-relaxed text-[#586574]'>{comment.content}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <div className='flex flex-col items-center py-10 text-center'>
                <MessageSquare className='size-8 text-[#d0d4da]' />
                <p className='mt-3 text-[12px] font-medium text-[#a0a8b4]'>No reviews yet</p>
                <p className='mt-1 text-[11px] text-[#c0c8d2]'>Be the first to share your experience!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
