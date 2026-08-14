/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, Calendar, Star, Trophy } from 'lucide-react';
import { WebNavigation } from '@/db/supabase/types';

interface MiddleColumnProps {
  tools: WebNavigation[];
  categories: Array<{ id: string; name: string; title: string }>;
  selectedToolId?: string | null;
  onSelectTool: (tool: WebNavigation) => void;
}

function getScoreClass(rating: number): string {
  if (rating >= 8) return 'high';
  if (rating >= 5) return 'mid';
  return 'low';
}

function getPricingLabel(websiteData: string): { label: string; type: string } {
  try {
    const data = JSON.parse(websiteData);
    const pricing = (data?.pricing || '').toLowerCase();
    if (pricing.includes('free')) return { label: 'Free', type: 'free' };
    if (pricing.includes('freemium')) return { label: 'Freemium', type: 'free' };
    return { label: 'Paid', type: 'paid' };
  } catch {
    return { label: '', type: '' };
  }
}

function getClipScore(websiteData: string): number | null {
  try {
    const data = JSON.parse(websiteData);
    const b = data?.benchmarks;
    if (!b || typeof b !== 'object') return null;
    const weightKeys = ['swe_bench_verified', 'terminal_bench', 'swe_bench_pro', 'aider_polyglot', 'live_code_bench'];
    const weightValues = [0.30, 0.25, 0.20, 0.15, 0.10];
    let tw = 0;
    let ws = 0;
    weightKeys.forEach((k, i) => {
      if (b[k] != null) { ws += b[k] * weightValues[i]; tw += weightValues[i]; }
    });
    return tw > 0 ? Math.round((ws / tw) * 10) / 10 : null;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export default function MiddleColumn({ tools, categories, selectedToolId, onSelectTool }: MiddleColumnProps) {
  const router = useRouter();
  const t = useTranslations('Home');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/query/${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, router]);

  const filteredTools = tools.filter((tool) => {
    if (activeFilter !== 'all' && tool.category_name !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (tool.title || '').toLowerCase();
      const content = (tool.content || '').toLowerCase();
      const tags = (tool.tag_name || '').toLowerCase();
      return title.includes(q) || content.includes(q) || tags.includes(q);
    }
    return true;
  });

  return (
    <div className='middle-col'>
      {/* Search */}
      <form onSubmit={handleSearch} className='search-row'>
        <input
          type='search'
          className='search-input'
          placeholder={t('search') || 'Search AI tools...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          minLength={2}
        />
        <button type='submit' className='search-btn'>
          <Search className='size-4' />
        </button>
      </form>

      {/* Filter tabs */}
      <div className='filter-tabs'>
        <button
          type='button'
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            type='button'
            key={cat.id}
            className={`filter-tab ${activeFilter === cat.name ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat.name)}
          >
            {cat.title || cat.name}
          </button>
        ))}
      </div>

      {/* Tool list */}
      <div className='space-y-0'>
        {filteredTools.map((tool) => {
          const pricing = getPricingLabel(tool.website_data || '{}');
          const tags = (tool.tag_name || '').split(',').filter(Boolean);
          const isSelected = selectedToolId === tool.name;
          const clipScore = getClipScore(tool.website_data || '{}');

          return (
            <div
              key={tool.id}
              className={`tool-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectTool(tool)}
            >
              <div className='tool-card-header'>
                <div className='flex-1 min-w-0'>
                  <div className='tool-card-title'>{tool.title}</div>
                  <div className='tool-card-meta'>
                    <span className='tool-card-date'>
                      <Calendar className='mr-1 inline size-3' />
                      {formatDate(tool.collection_time || '')}
                    </span>
                    <span className='flex items-center gap-1 text-xs text-[#7b869a]'>
                      {tool.category_name}
                    </span>
                  </div>
                </div>
                {/* Score badges */}
                <div className='flex items-center gap-2'>
                  {clipScore != null && (
                    <div className='flex items-center gap-0.5 rounded bg-[#e8f4f6] px-1.5 py-0.5 text-[11px] font-bold text-[#135e6b]'>
                      <Trophy className='size-3' />
                      {clipScore}
                    </div>
                  )}
                  {(tool.star_rating != null && tool.star_rating > 0) && (
                    <div className={`tool-card-score ${getScoreClass(tool.star_rating)}`}>
                      <Star className='size-3' />
                      {tool.star_rating}/10
                    </div>
                  )}
                </div>
              </div>

              {/* Tags + pricing */}
              <div className='tool-card-tags'>
                {pricing.label && (
                  <span className={`tool-card-pricing ${pricing.type}`}>
                    {pricing.label}
                  </span>
                )}
                {tags.slice(0, 3).map((tag) => (
                  <span key={tag} className='tool-card-tag'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {filteredTools.length === 0 && (
          <div className='flex-center py-12 text-sm text-[#7b869a]'>
            No tools found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
