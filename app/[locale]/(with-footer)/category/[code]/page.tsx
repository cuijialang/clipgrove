import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/db/supabase/client';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteSidebar from '@/components/layout/SiteSidebar';
import ToolIcon from '@/components/layout/ToolIcon';
import { ChevronRight } from 'lucide-react';

import { InfoPageSize } from '@/lib/constants';

const CATEGORY_ICONS: Record<string, string> = {
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
  'ai-side': '💰',
};

function getEmoji(cat: string) {
  return CATEGORY_ICONS[cat] || '📦';
}

/** Strip markdown image syntax from content text */
function cleanContent(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
}

export async function generateMetadata({
  params,
}: {
  params: { code: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const { data: categoryList } = await supabase
    .from('navigation_category')
    .select()
    .eq('name', params.code);
  if (!categoryList || !categoryList[0]) notFound();
  return { title: categoryList[0].title };
}

export default async function Page({
  params,
}: {
  params: { code: string };
}) {
  const supabase = createClient();
  const [
    { data: categoryList },
    { data: navigationList },
    { data: allCategories },
  ] = await Promise.all([
    supabase.from('navigation_category').select().eq('name', params.code),
    supabase
      .from('web_navigation')
      .select()
      .eq('category_name', params.code)
      .range(0, InfoPageSize - 1)
      .order('collection_time', { ascending: false }),
    supabase.from('navigation_category').select().order('sort', { ascending: true }),
  ]);

  if (!categoryList || !categoryList[0]) notFound();
  const category = categoryList[0];
  const tools = navigationList || [];

  const categories = (allCategories || []).map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    title: cat.title || cat.name,
  }));

  return (
    <div className='site-wrap'>
      <SiteHeader />
      <div className='site-body'>
        <SiteSidebar categories={categories} />
        <main className='site-main'>
          {/* Breadcrumb */}
          <div className='detail-breadcrumb'>
            <Link href='/'>AI工具集</Link>
            <ChevronRight size={12} />
            <span>{category.title || category.name}</span>
          </div>

          {/* Title */}
          <div className='home-section-header'>
            <h1 className='home-section-title'>
              {getEmoji(category.name)} {category.title}
            </h1>
          </div>

          {/* ai-bot.cn style inline tool list */}
          {tools.length > 0 ? (
            <div className='ai-bot-cards-grid'>
              {tools.map((tool) => {
                const toolTitle = (tool.title || '').replace(/^\*\*(.+?)\*\*.*/, '$1') || tool.title;
                return (
                  <Link
                    key={tool.id}
                    href={`/ai/${tool.name}`}
                    className='ai-bot-card'
                  >
                    <div className='ai-bot-card-icon'>
                      <ToolIcon
                        src={tool.thumbnail_url}
                        alt={tool.title || ''}
                        emoji={getEmoji(tool.category_name || '')}
                        websiteUrl={tool.url}
                      />
                    </div>
                    <div className='ai-bot-card-body'>
                      <span className='ai-bot-card-title'>{toolTitle}</span>
                      <span className='ai-bot-card-desc'>{cleanContent(tool.content)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 0',
                color: '#9ca3af',
              }}
            >
              <p style={{ fontSize: 16 }}>暂无工具</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
