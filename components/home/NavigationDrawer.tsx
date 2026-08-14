'use client';

/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';

function NavDrawerItem({ isActive, name }: { isActive: boolean; name: string }) {
  return (
    <li
      className={cn(
        'flex h-[42px] w-full items-center justify-between rounded-[8px] border px-4 transition-all duration-300',
        isActive
          ? 'border-primary/30 bg-primary/10 text-white'
          : 'border-transparent bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80',
      )}
    >
      <span className='text-sm font-medium'>{name}</span>
      {isActive && (
        <span className='h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent' />
      )}
    </li>
  );
}

export default function NavigationDrawer({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(open);
  const router = useRouter();

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const NavLinks = NAV_LINKS.map((item) => ({
    ...item,
    label: t(`${item.code}`),
  }));

  const onClose = () => {
    setOpen(false);
    setIsOpen(false);
  };

  const onRoute = (route: string) => {
    router.push(route);
    onClose();
  };

  return (
    <>
      <div
        className={cn('fixed z-50 h-screen w-screen overflow-hidden bg-black/60 backdrop-blur-sm', isOpen ? 'block' : 'hidden')}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed right-0 top-16 z-[99999] h-[calc(100%-64px)] w-[276px] border-l border-white/5 bg-[#0d0d14]/95 backdrop-blur-xl shadow-2xl transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className='flex size-full flex-col gap-2 px-4 py-6'>
          {NavLinks.map((item) => (
            <button type='button' key={item.code} onClick={() => onRoute(item.href)}>
              <NavDrawerItem
                name={item.label}
                isActive={pathname === item.href || (pathname.includes(item.href) && item.href !== '/')}
              />
              <span className='sr-only'>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
