/* eslint-disable react/no-danger */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Star, MessageSquare, User, Calendar, Heart, Share2, ChevronRight } from 'lucide-react';
import { WebNavigation } from '@/db/supabase/types';
import ToolIcon from '@/components/layout/ToolIcon';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface DetailContentProps {
  tool: WebNavigation;
  categoryTitle: string;
  relatedTools: WebNavigation[];
}

const CATEGORY_EMOJI: Record<string, string> = {
  'ai-writing': '✍️',
  'ai-image': '🖼️',
  'ai-video': '🎬',
  'ai-office': '📊',
  'ai-agent': '🤖',
  'ai-chat': '💬',
  'ai-programming': '💻',
  'ai-design': '🎨',
  'ai-audio': '🎵',
  'ai-search': '🔍',
  'ai-platform': '⚙️',
  'ai-learning': '📚',
  'ai-model': '🧠',
  'ai-detect': '🔎',
  'ai-prompt': '💡',
  'text-to-video': '🎬',
  'ai-animation': '🎞️',
  'ai-avatar': '👤',
  'ai-video-editing': '✂️',
  'ai-shorts': '📱',
  'image-to-video': '🖼️',
  'ai-voiceover': '🎙️',
  'video-enhancement': '✨',
  'coding-agent': '💻',
  'autonomous-agent': '🤖',
  'agent-framework': '🔧',
  'browser-agent': '🌐',
  'workflow-agent': '⚡',
};

function getPricingLabel(websiteData: string): { label: string; type: string } {
  try {
    const data = JSON.parse(websiteData);
    const pricing = (data?.pricing || '').toLowerCase();
    if (pricing.includes('free')) return { label: '免费', type: 'free' };
    if (pricing.includes('freemium')) return { label: 'Freemium', type: 'free' };
    return { label: '付费', type: 'paid' };
  } catch {
    return { label: '', type: '' };
  }
}

function formatRelativeDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} 天前`;
    return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function DetailContent({ tool, categoryTitle, relatedTools }: DetailContentProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  const pricing = getPricingLabel(tool.website_data || '{}');
  const tags = (tool.tag_name || '').split(',').filter(Boolean);
  const catEmoji = CATEGORY_EMOJI[tool.category_name || ''] || '📦';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`comments_${tool.name}`);
      if (stored) {
        setComments(JSON.parse(stored));
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    }
  }, [tool]);

  const handleSubmitComment = useCallback(() => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    const comment: Comment = {
      id: Date.now(),
      author_name: authorName.trim() || '匿名用户',
      content: newComment.trim(),
      created_at: new Date().toISOString(),
    };
    const updated = [comment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`comments_${tool.name}`, JSON.stringify(updated));
    } catch { /* ignore */ }
    setNewComment('');
    setSubmitting(false);
  }, [newComment, authorName, comments, submitting, tool.name]);

  return (
    <div className='detail-content'>
      {/* Breadcrumb */}
      <div className='detail-breadcrumb'>
        <a href='/' className='detail-breadcrumb-link'>首页</a>
        <ChevronRight className='size-3 text-[#9ca3af]' />
        <a href={`/category/${tool.category_name}`} className='detail-breadcrumb-link'>
          {catEmoji} {categoryTitle}
        </a>
        <ChevronRight className='size-3 text-[#9ca3af]' />
        <span className='text-[13px] text-[#6b7280]'>{tool.title}</span>
      </div>

      {/* Hero Card */}
      <div className='detail-hero-card'>
        <div className='flex gap-5'>
          {/* Icon */}
          <div className='detail-hero-icon'>
            <ToolIcon
              src={tool.thumbnail_url}
              alt={tool.title || ''}
              emoji={catEmoji}
              websiteUrl={tool.url}
              className='size-full rounded-xl object-cover'
            />
          </div>

          {/* Info */}
          <div className='flex flex-1 flex-col'>
            <div className='flex flex-wrap items-center gap-2 mb-2'>
              <span className='detail-badge-purple'>
                {catEmoji} {categoryTitle}
              </span>
              {pricing.label && (
                <span className={`detail-badge ${pricing.type}`}>
                  {pricing.label}
                </span>
              )}
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className='detail-badge-tag'>{tag}</span>
              ))}
            </div>

            <h1 className='detail-hero-title'>{tool.title}</h1>
            <p className='detail-hero-desc'>{tool.content || '暂无描述'}</p>

            <div className='flex flex-wrap items-center gap-4 mt-3'>
              {tool.star_rating != null && tool.star_rating > 0 && (
                <div className='flex items-center gap-1.5'>
                  <div className='flex items-center gap-0.5'>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className='size-4'
                        fill={i <= Math.round(tool.star_rating / 2) ? '#f59e0b' : 'none'}
                        color={i <= Math.round(tool.star_rating / 2) ? '#f59e0b' : '#d1d5db'}
                      />
                    ))}
                  </div>
                  <span className='text-[13px] font-semibold text-[#374151]'>{tool.star_rating}/10</span>
                </div>
              )}
              <span className='flex items-center gap-1 text-[12px] text-[#9ca3af]'>
                <Calendar className='size-3.5' />
                {tool.collection_time ? new Date(tool.collection_time).toLocaleDateString('zh-CN') : ''}
              </span>
            </div>

            {/* Action buttons */}
            <div className='flex flex-wrap items-center gap-3 mt-4'>
              <a
                href={tool.url}
                target='_blank'
                rel='noreferrer nofollow'
                className='detail-btn-primary'
              >
                <ExternalLink className='size-4' />
                访问官网
              </a>
              <button
                type='button'
                className={`detail-btn-secondary ${liked ? 'liked' : ''}`}
                onClick={() => setLiked(!liked)}
              >
                <Heart className='size-4' fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#6b7280'} />
                {liked ? '已收藏' : '收藏'}
              </button>
              <button
                type='button'
                className='detail-btn-secondary'
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
              >
                <Share2 className='size-4' />
                分享
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Section */}
      <div className='detail-section'>
        <h2 className='detail-section-title'>详细介绍</h2>
        <div className='detail-section-body'>
          {tool.detail ? (
            <div
              className='detail-prose'
              dangerouslySetInnerHTML={{ __html: tool.detail }}
            />
          ) : (
            <div className='text-center py-12 text-[#9ca3af]'>
              <p className='text-sm'>暂无详细介绍</p>
              <p className='text-xs mt-1'>点击上方「访问官网」了解更多</p>
            </div>
          )}
        </div>
      </div>

      {/* Screenshot / Preview */}
      {tool.thumbnail_url && (
        <div className='detail-section'>
          <h2 className='detail-section-title'>预览截图</h2>
          <div className='detail-section-body'>
            <ToolIcon
              src={tool.thumbnail_url}
              alt={tool.title || ''}
              emoji={catEmoji}
              websiteUrl={tool.url}
              className='w-full max-w-2xl rounded-xl border border-[#e5e7eb]'
            />
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className='detail-section'>
        <h2 className='detail-section-title'>
          <MessageSquare className='size-5' />
          用户评价
          <span className='text-[13px] font-normal text-[#9ca3af]'>({comments.length})</span>
        </h2>

        {/* Comment Form */}
        <div className='detail-comment-form'>
          <div className='flex gap-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[13px] font-bold text-[#6b7280]'>
              <User className='size-4' />
            </div>
            <div className='flex flex-1 flex-col gap-3'>
              <input
                type='text'
                className='detail-input'
                placeholder='你的昵称（选填）'
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                maxLength={50}
              />
              <textarea
                className='detail-textarea'
                placeholder='分享你的使用体验...'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <div className='flex items-center justify-between'>
                <span className='text-[12px] text-[#9ca3af]'>{newComment.length}/500</span>
                <button
                  type='button'
                  className='detail-btn-primary'
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                >
                  {submitting ? '提交中...' : '发表评价'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comment List */}
        <div className='detail-section-body'>
          {comments.map((comment) => (
            <div key={comment.id} className='detail-comment-item'>
              <div className='flex items-start gap-3'>
                <div className='flex size-8 shrink-0 items-center justify-center rounded-full bg-[#ede9fe] text-[11px] font-bold text-[#7c3aed]'>
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='text-[13px] font-semibold text-[#1f2937]'>{comment.author_name}</span>
                    <span className='text-[11px] text-[#9ca3af]'>{formatRelativeDate(comment.created_at)}</span>
                  </div>
                  <p className='mt-1 text-[13px] leading-relaxed text-[#4b5563]'>{comment.content}</p>
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
            <div className='flex flex-col items-center py-10 text-center'>
              <MessageSquare className='size-8 text-[#d1d5db]' />
              <p className='mt-3 text-[13px] font-medium text-[#9ca3af]'>暂无评价</p>
              <p className='mt-1 text-[12px] text-[#c0c8d2]'>成为第一个评价的用户吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className='detail-section'>
          <h2 className='detail-section-title'>相关推荐</h2>
          <div className='detail-section-body'>
            <div className='detail-related-grid'>
              {relatedTools.slice(0, 6).map((rt) => {
                const rp = getPricingLabel(rt.website_data || '{}');
                return (
                  <a
                    key={rt.id}
                    href={`/ai/${rt.name}`}
                    className='detail-related-card'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f6] overflow-hidden'>
                        <ToolIcon
                          src={rt.thumbnail_url}
                          alt={rt.title || ''}
                          emoji={CATEGORY_EMOJI[rt.category_name || ''] || '📦'}
                          websiteUrl={rt.url}
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='text-[13px] font-semibold text-[#1f2937] truncate'>{rt.title}</div>
                        <div className='flex items-center gap-2 mt-0.5'>
                          {rp.label && (
                            <span className={`text-[11px] ${rp.type === 'free' ? 'text-[#059669]' : 'text-[#d97706]'}`}>
                              {rp.label}
                            </span>
                          )}
                          {rt.star_rating != null && rt.star_rating > 0 && (
                            <span className='flex items-center gap-0.5 text-[11px] text-[#9ca3af]'>
                              <Star className='size-2.5' fill='#f59e0b' color='#f59e0b' />
                              {rt.star_rating}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
