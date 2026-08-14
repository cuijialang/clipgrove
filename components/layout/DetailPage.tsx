/* eslint-disable react/no-danger */

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ExternalLink, ChevronRight, MessageSquare, User, Heart, Share2, Star } from 'lucide-react';
import { WebNavigation } from '@/db/supabase/types';
import ToolIcon from '@/components/layout/ToolIcon';

interface Comment {
  id: number;
  author_name: string;
  content: string;
  created_at: string;
}

interface DetailPageProps {
  tool: WebNavigation;
  categoryTitle: string;
  relatedTools: WebNavigation[];
}

/** Strip markdown image syntax from content */
function cleanContent(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
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

function formatCollectionDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Extract pricing info from website_data JSON */
function getPricingTag(websiteData: string | null | undefined): string | null {
  if (!websiteData) return null;
  try {
    const data = JSON.parse(websiteData);
    if (data.pricing || data.pricing_type) {
      return data.pricing || data.pricing_type;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

function getPricingClass(pricing: string): string {
  const lower = pricing.toLowerCase();
  if (lower.includes('免费') || lower.includes('free')) return 'green';
  if (lower.includes('付费') || lower.includes('paid') || lower.includes('pro')) return 'orange';
  return 'gray';
}

/** Split HTML content by h2 tags, returning sections with titles */
function splitDetailByH2(html: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  const matches = Array.from(html.matchAll(h2Regex));

  if (matches.length === 0) {
    if (html.trim()) {
      sections.push({ title: '', content: html });
    }
    return sections;
  }

  // Content before first h2
  if (matches[0].index !== undefined && matches[0].index > 0) {
    const before = html.slice(0, matches[0].index).trim();
    if (before) {
      sections.push({ title: '', content: before });
    }
  }

  // Each h2 section
  for (let i = 0; i < matches.length; i += 1) {
    const title = matches[i][1].replace(/<[^>]*>/g, '').trim();
    const contentStart = (matches[i].index || 0) + matches[i][0].length;
    const contentEnd = i < matches.length - 1 ? (matches[i + 1].index || 0) : html.length;
    const content = html.slice(contentStart, contentEnd).trim();
    sections.push({ title, content });
  }

  return sections;
}

export default function DetailPage({ tool, categoryTitle, relatedTools }: DetailPageProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [shareTip, setShareTip] = useState(false);

  const tags = (tool.tag_name || '').split(',').filter(Boolean);
  const pricingTag = getPricingTag(tool.website_data);
  const collectionDate = formatCollectionDate(tool.collection_time);
  const starRating = tool.star_rating || 0;
  const hasDetail = !!(tool.detail && cleanContent(tool.detail).length > 0);
  const detailSections = hasDetail ? splitDetailByH2(tool.detail!) : [];

  // Load liked state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`liked_${tool.name}`);
      setLiked(stored === 'true');
    } catch {
      setLiked(false);
    }
  }, [tool.name]);

  // Load comments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`comments_${tool.name}`);
      if (stored) setComments(JSON.parse(stored));
      else setComments([]);
    } catch {
      setComments([]);
    }
  }, [tool.name]);

  const toggleLike = useCallback(() => {
    const newLiked = !liked;
    setLiked(newLiked);
    try {
      localStorage.setItem(`liked_${tool.name}`, String(newLiked));
    } catch { /* ignore */ }
  }, [liked, tool.name]);

  const handleShare = useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setShareTip(true);
      setTimeout(() => setShareTip(false), 2000);
    }).catch(() => {
      // Fallback: do nothing
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const comment: Comment = {
      id: Date.now(),
      author_name: nickname.trim() || '匿名用户',
      content: commentText.trim(),
      created_at: new Date().toISOString(),
    };
    const updated = [comment, ...comments];
    setComments(updated);
    try {
      localStorage.setItem(`comments_${tool.name}`, JSON.stringify(updated));
    } catch { /* ignore */ }
    setCommentText('');
    setSubmitting(false);
  }, [commentText, nickname, comments, submitting, tool.name]);

  return (
    <div className='detail-wrap'>
      {/* Breadcrumb */}
      <div className='detail-breadcrumb'>
        <Link href='/'>AI工具集</Link>
        <ChevronRight size={12} />
        <Link href={`/category/${tool.category_name}`}>{categoryTitle}</Link>
        <ChevronRight size={12} />
        <span>{tool.title}</span>
      </div>

      {/* Hero */}
      <div className='detail-hero'>
        <div className='detail-hero-top'>
          <div className='detail-hero-icon'>
            <ToolIcon
              src={tool.thumbnail_url}
              alt={tool.title || ''}
              emoji='📦'
              websiteUrl={tool.url}
            />
          </div>
          <div className='detail-hero-info'>
            {/* Tags */}
            <div className='detail-hero-meta'>
              {categoryTitle && <span className='detail-tag'>{categoryTitle}</span>}
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className='detail-tag gray'>{tag}</span>
              ))}
              {pricingTag && (
                <span className={`detail-tag ${getPricingClass(pricingTag)}`}>{pricingTag}</span>
              )}
            </div>

            {/* Title + Star rating */}
            <h1 className='detail-hero-title'>
              {tool.title}
              {starRating > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, marginLeft: 10 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.round(starRating) ? '#f59e0b' : 'none'}
                      color={i < Math.round(starRating) ? '#f59e0b' : '#d1d5db'}
                    />
                  ))}
                </span>
              )}
            </h1>

            {/* Description */}
            <p className='detail-hero-desc'>{cleanContent(tool.content) || '暂无描述'}</p>

            {/* Collection date */}
            {collectionDate && (
              <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
                收藏日期：{collectionDate}
              </p>
            )}

            {/* Action buttons */}
            <div className='detail-hero-actions'>
              <a
                href={tool.url}
                target='_blank'
                rel='noreferrer nofollow'
                className='detail-btn detail-btn-primary'
              >
                <ExternalLink size={14} />
                访问官网
              </a>
              <button
                type='button'
                className='detail-btn detail-btn-outline'
                onClick={toggleLike}
              >
                <Heart
                  size={14}
                  fill={liked ? '#ef4444' : 'none'}
                  color={liked ? '#ef4444' : 'currentColor'}
                />
                {liked ? '已收藏' : '收藏'}
              </button>
              <button
                type='button'
                className='detail-btn detail-btn-outline'
                onClick={handleShare}
              >
                <Share2 size={14} />
                {shareTip ? '已复制链接' : '分享'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail sections — split by h2 */}
      {hasDetail && detailSections.length > 0 ? (
        detailSections.map((section, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={idx} className='detail-section'>
            {section.title ? (
              <>
                <h2 className='detail-section-title'>{section.title}</h2>
                <div
                  className='detail-section-body detail-prose'
                  dangerouslySetInnerHTML={{
                    __html: section.content || '',
                  }}
                />
              </>
            ) : (
              <div
                className='detail-section-body detail-prose'
                dangerouslySetInnerHTML={{
                  __html: section.content || '',
                }}
              />
            )}
          </div>
        ))
      ) : (
        /* Fallback when no detail content */
        <div className='detail-section'>
          <h2 className='detail-section-title'>{tool.title}是什么</h2>
          <div className='detail-section-body'>
            <p>{cleanContent(tool.content) || '暂无详细介绍'}</p>
            {tool.url && (
              <p style={{ marginTop: 12 }}>
                {tool.title}官网地址：
                <a
                  href={tool.url}
                  target='_blank'
                  rel='noreferrer nofollow'
                  style={{ color: 'var(--primary)', fontWeight: 600 }}
                >
                  {tool.url}
                </a>
              </p>
            )}
          </div>
        </div>
      )}

      {/* User reviews */}
      <div className='detail-section'>
        <h2 className='detail-section-title'>
          <MessageSquare size={16} />
          用户评价
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400, marginLeft: 8 }}>
            ({comments.length})
          </span>
        </h2>

        {/* Comment form */}
        <div className='comment-form'>
          <div className='comment-avatar'>
            <User size={18} />
          </div>
          <div className='comment-form-body'>
            <div className='comment-form-row'>
              <input
                className='comment-input'
                placeholder='昵称'
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={50}
              />
              <input
                className='comment-input'
                placeholder='邮箱'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className='comment-input'
                placeholder='网址'
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <textarea
              className='comment-textarea'
              placeholder='输入评论内容...'
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              maxLength={500}
            />
            <div className='comment-submit-row'>
              <span style={{ fontSize: 12, color: '#d1d5db' }}>{commentText.length}/500</span>
              <button
                type='button'
                className='comment-submit-btn'
                onClick={handleSubmit}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? '提交中...' : '发表评论'}
              </button>
            </div>
          </div>
        </div>

        {/* Comment list */}
        <div className='detail-section-body' style={{ paddingTop: 0 }}>
          {comments.map((comment) => (
            <div key={comment.id} className='comment-item'>
              <div className='comment-item-avatar'>
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div className='comment-item-body'>
                <div className='comment-item-author'>
                  {comment.author_name}
                  <span className='comment-item-time'>{formatRelativeDate(comment.created_at)}</span>
                </div>
                <p className='comment-item-text'>{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: 13 }}>
              <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>暂无评价，成为第一个评价的用户吧！</p>
            </div>
          )}
        </div>
      </div>

      {/* Related tools */}
      {relatedTools.length > 0 && (
        <div className='detail-section'>
          <h2 className='detail-section-title'>类似于{tool.title}的工具</h2>
          <div className='detail-section-body'>
            <div className='related-tools-grid'>
              {relatedTools.slice(0, 6).map((rt) => (
                <Link key={rt.id} href={`/ai/${rt.name}`} className='related-tool-card'>
                  <div className='related-tool-icon'>
                    <ToolIcon
                      src={rt.thumbnail_url}
                      alt={rt.title || ''}
                      emoji='📦'
                      websiteUrl={rt.url}
                    />
                  </div>
                  <div className='related-tool-info'>
                    <div className='related-tool-name'>{rt.title}</div>
                    <div className='related-tool-desc'>{cleanContent(rt.content)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Copyright */}
      <div className='detail-copyright'>
        &copy;版权声明：若无特殊声明，本站所有文章版权均归AI工具集原创和所有，未经许可，任何个人、媒体、网站、团体不得转载、抄袭或以其他方式复制发表本站内容，或在非我站所属的服务器上建立镜像。否则，我站将依法保留追究相关法律责任的权利。
      </div>
    </div>
  );
}
