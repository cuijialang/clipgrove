/* eslint-disable react/no-unused-prop-types */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Bot, Video, Cpu } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  title: string;
}

interface LeftSidebarProps {
  categories: Category[];
}

const VIDEO_CATEGORIES = ['text-to-video', 'ai-animation', 'ai-avatar', 'ai-video-editing', 'ai-shorts', 'image-to-video', 'ai-voiceover', 'video-enhancement'];
const AGENT_CATEGORIES = ['coding-agent', 'autonomous-agent', 'agent-framework', 'browser-agent', 'workflow-agent'];

export default function LeftSidebar({ categories }: LeftSidebarProps) {
  const pathname = usePathname();
  const isActive = (name: string) => pathname.includes(`/category/${name}`);

  const videoCategories = categories.filter((c) => VIDEO_CATEGORIES.includes(c.name));
  const agentCategories = categories.filter((c) => AGENT_CATEGORIES.includes(c.name));

  const sections = [
    {
      key: 'video',
      icon: <Video className='size-3.5' />,
      title: 'AI 视频生成工具',
      subtitle: '发现最好的AI视频生成工具',
      cats: videoCategories,
    },
    {
      key: 'agent',
      icon: <Cpu className='size-3.5' />,
      title: 'AI Agent 工具',
      subtitle: '发现最好的AI Agent工具',
      cats: agentCategories,
    },
  ];

  return (
    <div className='flex h-full flex-col px-3 py-4'>
      {sections.map(({ key, icon, title, subtitle, cats }) => (
        <div key={key} className='mb-5 last:mb-0'>
          {/* Section header */}
          <div className='mb-2 rounded-lg bg-gradient-to-r from-[#f5f6f7] to-transparent px-2.5 py-2'>
            <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7b869a]'>
              {icon}
              {title}
            </div>
            <div className='mt-0.5 text-[10px] text-[#a0a8b4]'>
              {subtitle}
            </div>
          </div>

          {/* Category links */}
          {cats.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.name}`}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                isActive(cat.name)
                  ? 'bg-[#e8f4f6] text-[#135e6b]'
                  : 'text-[#586574] hover:bg-[#f5f6f7] hover:text-[#1c2733]'
              }`}
            >
              <span className='flex size-5 shrink-0 items-center justify-center rounded bg-[#f0f1f2] text-[10px] font-bold text-[#586574]'>
                {cat.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
              <span className='truncate'>{cat.title || cat.name}</span>
            </Link>
          ))}
        </div>
      ))}

      {/* Bottom links */}
      <div className='mt-auto border-t border-[#eef0f2] pt-4'>
        <Link
          href='/explore'
          className='flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#586574] hover:bg-[#f5f6f7] hover:text-[#1c2733] transition-colors'
        >
          <Box className='size-4' />
          Explore All
        </Link>
        <Link
          href='/submit'
          className='flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-[#586574] hover:bg-[#f5f6f7] hover:text-[#1c2733] transition-colors'
        >
          <Bot className='size-4' />
          Submit Tool
        </Link>
      </div>
    </div>
  );
}
