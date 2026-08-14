'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Menu, Plus } from 'lucide-react';
import LocaleSwitcher from '@/components/LocaleSwitcher';
import BaseImage from '@/components/image/BaseImage';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  const navLinks = [
    { href: '/', label: t('discover') || 'Discover' },
    { href: '/submit', label: t('submit') || 'Submit' },
    { href: '/explore', label: t('explore') || 'Explore' },
  ];

  return (
    <header className='relative z-20 flex h-14 shrink-0 items-center border-b border-[#eef0f2] bg-white/90 px-5 backdrop-blur-md'>
      {/* Mobile menu button */}
      <button
        type='button'
        className='mr-3 flex size-9 items-center justify-center rounded-lg hover:bg-[#f0f1f2] lg:hidden'
        onClick={onMenuClick}
      >
        <Menu className='size-5 text-[#586574]' />
      </button>

      {/* Logo */}
      <Link href='/' className='mr-8 flex shrink-0 items-center gap-2'>
        <BaseImage
          src='/images/clipgrove-logo.svg'
          alt='ClipGrove'
          width={32}
          height={32}
          className='size-8'
        />
        <span className='hidden text-base font-bold text-[#1c2733] sm:inline'>
          ClipGrove
        </span>
      </Link>

      {/* Desktop nav links */}
      <nav className='hidden items-center gap-1 lg:flex'>
        {navLinks.map((link) => {
          const isActive = pathname === link.href ||
            (link.href !== '/' && pathname.includes(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[#e8f4f6] text-[#135e6b]'
                  : 'text-[#586574] hover:bg-[#f5f6f7] hover:text-[#1c2733]'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className='ml-auto flex items-center gap-2'>
        <Link
          href='/submit'
          className='hidden items-center gap-1.5 rounded-lg bg-[#135e6b] px-3 py-1.5 text-[13px] font-semibold text-white transition-all hover:bg-[#0f4d58] active:scale-[0.98] sm:flex'
        >
          <Plus className='size-3.5' />
          Submit
        </Link>
        <LocaleSwitcher />
      </div>
    </header>
  );
}
