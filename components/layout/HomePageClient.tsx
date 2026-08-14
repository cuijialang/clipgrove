'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteSidebar from '@/components/layout/SiteSidebar';
import ToolIcon from '@/components/layout/ToolIcon';

/* ================================================================
   Constants
   ================================================================ */

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

const QUICK_LINKS = [
  { label: 'AI快讯', href: '/daily-news' },
  { label: 'AI项目', href: '/latest' },
  { label: 'AI百科', href: '/wiki' },
  { label: 'AI交流群', href: '/community' },
  { label: '最新AI项目', href: '/latest' },
  { label: '热门AI教程', href: '/tutorials' },
];

const BANNER_LINKS = [
  { label: '每日AI快讯热闻', sub: '最新AI动态', href: '/daily-news', icon: '📰', color: 'purple' },
  { label: 'AI交流群', sub: '加入AI社群', href: '/community', icon: '💬', color: 'blue' },
  { label: '最新AI项目', sub: '发现新项目', href: '/latest', icon: '🚀', color: 'green' },
  { label: '热门AI教程', sub: '学习AI技能', href: '/tutorials', icon: '📚', color: 'orange' },
];

/* Sub-tabs for specific categories */
const CATEGORY_SUB_TABS: Record<string, string[]> = {
  'ai-image': [
    '常用AI图像工具',
    'AI图片插画生成',
    'AI图片背景移除',
    'AI图片物体抹除',
    'AI图片无损放大',
    'AI图片优化修复',
    'AI商品图生成',
    'AI 3D模型生成',
  ],
  'ai-office': [
    'AI幻灯片和演示',
    'AI表格数据处理',
    'AI思维导图',
    'AI文档工具',
    'AI会议工具',
    'AI招聘求职',
    'AI法律助手',
    'AI语言翻译',
    'AI效率提升',
  ],
};

/* Ad banners */
const AD_BANNERS = [
  {
    title: 'Seko - AI智能写作助手',
    desc: '基于大模型的AI写作工具，支持多种文体创作',
    href: 'https://seko.ai',
    img: '',
  },
  {
    title: '蛙蛙写作 - 智能内容创作平台',
    desc: 'AI驱动的写作辅助工具，提升创作效率',
    href: 'https://wawawriting.com',
    img: '',
  },
  {
    title: 'AI工具集 - 发现更多AI工具',
    desc: '收录最新最全的AI工具和应用',
    href: '/explore',
    img: '',
  },
];

/* ================================================================
   Helpers
   ================================================================ */

function getEmoji(cat: string) {
  return CATEGORY_ICONS[cat] || '📦';
}

function cleanContent(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/!\[.*?\]\(.*?\)/g, '').trim();
}

/* ================================================================
   Types
   ================================================================ */

interface Tool {
  id: string | number;
  name: string;
  title?: string;
  content?: string;
  thumbnail_url?: string;
  url?: string;
  category_name?: string;
  star_rating?: number;
  collection_time?: string;
}

interface Category {
  id: string;
  name: string;
  title: string;
}

/* ================================================================
   Tool Card Component
   ================================================================ */

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/ai/${tool.name}`} className='ai-bot-card'>
      <div className='ai-bot-card-icon'>
        <ToolIcon
          src={tool.thumbnail_url}
          alt={tool.title || ''}
          emoji={getEmoji(tool.category_name || '')}
          websiteUrl={tool.url}
        />
      </div>
      <div className='ai-bot-card-body'>
        <span className='ai-bot-card-title'>{tool.title}</span>
        <span className='ai-bot-card-desc'>{cleanContent(tool.content)}</span>
      </div>
    </Link>
  );
}

/* ================================================================
   Category Section with optional sub-tabs
   ================================================================ */

function CategorySection({
  cat,
  tools,
  allTools,
}: {
  cat: Category;
  tools: Tool[];
  allTools: Tool[];
}) {
  const subTabs = CATEGORY_SUB_TABS[cat.name];
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);

  if (tools.length === 0) return null;

  const displayTools = activeSubTab
    ? allTools.slice(0, 12) // show all tools when sub-tab active (no sub-category mapping available)
    : tools.slice(0, 12);

  return (
    <section className='home-section'>
      <div className='home-section-header'>
        <h2 className='home-section-title'>
          {getEmoji(cat.name)} {cat.title}
        </h2>
        <Link href={`/category/${cat.name}`} className='home-section-more'>
          查看更多 &gt;&gt;
        </Link>
      </div>

      {subTabs && (
        <div className='home-section-tabs'>
          <button
            type='button'
            className={`home-section-tab${activeSubTab === null ? ' active' : ''}`}
            onClick={() => setActiveSubTab(null)}
          >
            全部
          </button>
            {subTabs.map((sub) => (
              <button
                type='button'
                key={sub}
                className={`home-section-tab${activeSubTab === sub ? ' active' : ''}`}
                onClick={() => setActiveSubTab(sub)}
              >
                {sub}
              </button>
            ))}
        </div>
      )}

      <div className='ai-bot-cards-grid'>
        {displayTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================
   Main Client Component
   ================================================================ */

interface HomePageClientProps {
  hotTools: Tool[];
  latestTools: Tool[];
  categories: Category[];
  toolsByCategory: Record<string, Tool[]>;
  allTools: Tool[];
}

export default function HomePageClient({
  hotTools,
  latestTools,
  categories,
  toolsByCategory,
  allTools,
}: HomePageClientProps) {
  const [activeTab, setActiveTab] = useState<'hot' | 'latest'>('hot');

  const currentTools = activeTab === 'hot' ? hotTools : latestTools;
  const currentTitle = activeTab === 'hot' ? '热门工具' : '最新收录';

  return (
    <div className='site-wrap'>
      <SiteHeader />
      <div className='site-body'>
        <SiteSidebar categories={categories} />
        <main className='site-main'>
          {/* Quick Links */}
          <div className='quick-links'>
            {QUICK_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className='quick-link'>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Banner Area */}
          <div className='home-banner-grid'>
            {BANNER_LINKS.map((banner) => (
              <Link
                key={banner.label}
                href={banner.href}
                className={`home-banner-card ${banner.color}`}
              >
                <span className='home-banner-card-icon'>{banner.icon}</span>
                <span className='home-banner-card-text'>
                  {banner.label}
                  <small>{banner.sub}</small>
                </span>
              </Link>
            ))}
          </div>

          {/* Tab Switch: 热门工具 / 最新收录 */}
          <div className='home-tabs'>
            <button
              type='button'
              className={`home-tab${activeTab === 'hot' ? ' active' : ''}`}
              onClick={() => setActiveTab('hot')}
            >
              热门工具
            </button>
            <button
              type='button'
              className={`home-tab${activeTab === 'latest' ? ' active' : ''}`}
              onClick={() => setActiveTab('latest')}
            >
              最新收录
            </button>
          </div>

          {/* Ad Banners */}
          <div className='home-ad-banner'>
            <div className='home-ad-banner-grid'>
              {AD_BANNERS.map((ad) => (
                <Link key={ad.title} href={ad.href} className='home-ad-banner-card' target='_blank' rel='noopener noreferrer'>
                  <div className='home-ad-banner-card-body'>
                    <div className='home-ad-banner-card-title'>{ad.title}</div>
                    <div className='home-ad-banner-card-desc'>{ad.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Current Tab Tools */}
          <section className='home-section'>
            <div className='home-section-header'>
              <h2 className='home-section-title'>{currentTitle}</h2>
              <Link href='/explore' className='home-section-more'>
                查看更多 &gt;&gt;
              </Link>
            </div>
            <div className='ai-bot-cards-grid'>
              {currentTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>

          {/* Category Sections */}
          {categories.map((cat) => (
            <CategorySection
              key={cat.id}
              cat={cat}
              tools={toolsByCategory[cat.name] || []}
              allTools={allTools}
            />
          ))}

          {/* Footer */}
          <footer className='site-footer'>
            <div className='footer-inner'>
              <div className='footer-brand'>
                <strong style={{ fontSize: 16, color: 'var(--text-primary)' }}>AI工具集</strong>
                <p>
                  AI工具集导航收录了国内外数百个不同类型的AI工具，每日更新和添加最新AI工具，
                  AI工具集还推荐了AI学习开发的常用网站、框架和模型，帮助你加入人工智能浪潮，自动化高效完成任务！
                </p>
                <p style={{ marginTop: 8 }}>
                  Ctrl + D 或 ⌘ + D 收藏本站到浏览器书签栏。
                </p>
              </div>
              <div className='footer-links'>
                <Link href='/'>AI工具集导航</Link>
                <Link href='/about'>关于我们</Link>
                <Link href='/disclaimer'>免责声明</Link>
                <Link href='/latest'>最新AI项目</Link>
                <Link href='/explore'>AI应用商店</Link>
              </div>
            </div>
            <div className='footer-bottom'>
              Copyright &copy; {new Date().getFullYear()} AI工具集
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
