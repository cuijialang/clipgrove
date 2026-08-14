'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Category {
  id: string;
  name: string;
  title: string;
}

interface SiteSidebarProps {
  categories: Category[];
}

/* ai-bot.cn 的 16 个分类 */
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

/* ai-bot.cn 侧边栏分类顺序 */
const CATEGORY_ORDER = [
  'ai-writing',
  'ai-image',
  'ai-video',
  'ai-office',
  'ai-agent',
  'ai-chat',
  'ai-programming',
  'ai-design',
  'ai-audio',
  'ai-search',
  'ai-platform',
  'ai-learning',
  'ai-model',
  'ai-detect',
  'ai-prompt',
  'ai-side',
];

export default function SiteSidebar({ categories }: SiteSidebarProps) {
  const pathname = usePathname();

  /* Sort categories to match ai-bot.cn order */
  const sorted = [...categories].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a.name);
    const ib = CATEGORY_ORDER.indexOf(b.name);
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  const isActive = (name: string) => {
    if (pathname === '/') return false;
    return pathname.includes(`/category/${name}`);
  };

  return (
    <aside className='site-sidebar'>
      <div className='sidebar-title'>AI工具分类</div>
      <nav className='sidebar-nav'>
        {sorted.map((cat) => {
          const icon = CATEGORY_ICONS[cat.name] || '📦';
          const active = isActive(cat.name);
          return (
            <Link
              key={cat.id}
              href={`/category/${cat.name}`}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <span className='sidebar-link-icon'>{icon}</span>
              <span>{cat.title || cat.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
