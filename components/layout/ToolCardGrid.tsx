'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Star } from 'lucide-react';
import { WebNavigation } from '@/db/supabase/types';
import ToolIcon from '@/components/layout/ToolIcon';

interface ToolCardGridProps {
  tools: WebNavigation[];
  categories: Array<{ id: string; name: string; title: string }>;
}

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

function getCategoryEmoji(categoryName: string): string {
  const map: Record<string, string> = {
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
  return map[categoryName] || '📦';
}

export default function ToolCardGrid({ tools, categories }: ToolCardGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredTools = activeCategory === 'all'
    ? tools
    : tools.filter((t) => t.category_name === activeCategory);

  return (
    <div className='tool-grid-area'>
      {/* Category tabs */}
      <div className='tool-grid-tabs'>
        <button
          type='button'
          className={`tool-grid-tab ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type='button'
            className={`tool-grid-tab ${activeCategory === cat.name ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.name)}
          >
            {getCategoryEmoji(cat.name)} {cat.title || cat.name}
          </button>
        ))}
      </div>

      {/* Tool cards grid */}
      <div className='tool-grid'>
        {filteredTools.map((tool) => {
          const pricing = getPricingLabel(tool.website_data || '{}');
          const tags = (tool.tag_name || '').split(',').filter(Boolean);

          return (
            <Link
              key={tool.id}
              href={`/ai/${tool.name}`}
              className='tool-grid-card'
            >
              {/* Icon */}
              <div className='tool-grid-card-icon'>
                <ToolIcon
                  src={tool.thumbnail_url}
                  alt={tool.title || ''}
                  emoji={getCategoryEmoji(tool.category_name || '')}
                  websiteUrl={tool.url}
                  className='size-10 rounded-lg object-cover'
                />
              </div>

              {/* Title */}
              <div className='tool-grid-card-title'>{tool.title}</div>

              {/* Description */}
              <div className='tool-grid-card-desc'>
                {tool.content || '暂无描述'}
              </div>

              {/* Tags */}
              <div className='tool-grid-card-tags'>
                {pricing.label && (
                  <span className={`tool-grid-card-tag ${pricing.type}`}>
                    {pricing.label}
                  </span>
                )}
                {tags.slice(0, 2).map((tag) => (
                  <span key={tag} className='tool-grid-card-tag'>
                    {tag}
                  </span>
                ))}
                {tool.star_rating != null && tool.star_rating > 0 && (
                  <span className='tool-grid-card-tag score'>
                    <Star className='size-2.5' fill='currentColor' />
                    {tool.star_rating}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className='flex flex-col items-center justify-center py-20 text-[#9ca3af]'>
          <span className='text-4xl'>🔍</span>
          <p className='mt-3 text-sm'>暂无工具，换个分类试试</p>
        </div>
      )}
    </div>
  );
}
