'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  title: string;
}

interface NewSidebarProps {
  categories: Category[];
}

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

export default function NewSidebar({ categories }: NewSidebarProps) {
  const pathname = usePathname();

  const isActive = (name: string) => pathname.includes(`/category/${name}`);

  return (
    <aside className='new-sidebar'>
      <div className='new-sidebar-title'>
        <Sparkles className='size-4' />
        AI 工具分类
      </div>
      <nav className='new-sidebar-nav'>
        {categories.map((cat) => {
          const icon = CATEGORY_ICONS[cat.name] || '📦';
          const active = isActive(cat.name);
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.name}`}
              className={`new-sidebar-link ${active ? 'active' : ''}`}
            >
              <span className='new-sidebar-link-icon'>{icon}</span>
              <span className='new-sidebar-link-text'>{cat.title || cat.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
