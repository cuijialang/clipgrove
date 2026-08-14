/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */

'use client';

import { useState } from 'react';
import { languages } from '@/i18n';
import { useLocale } from 'next-intl';

import { usePathname, useRouter } from '@/app/navigation';

export default function LocaleSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [localeVal, setLocaleVal] = useState(currentLocale);
  const [open, setOpen] = useState(false);

  const onSelect = (newLocale: string) => {
    setLocaleVal(newLocale);
    setOpen(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className='relative'>
      <button
        type='button'
        className='flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#586574] hover:bg-[#f0f1f2] hover:text-[#1c2733] transition-all'
        onClick={() => setOpen(!open)}
      >
        {localeVal.toUpperCase()}
        <svg className='size-3 opacity-50' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
          <path d='M6 9l6 6 6-6' />
        </svg>
      </button>
      {open && (
        <>
          <div className='fixed inset-0 z-10' onClick={() => setOpen(false)} />
          <div className='absolute right-0 top-full z-20 mt-1 min-w-[100px] overflow-hidden rounded-lg border border-[#eef0f2] bg-white py-1 shadow-lg'>
            {languages.map((language) => (
              <button
                type='button'
                key={language.code}
                className={`flex w-full items-center px-3 py-1.5 text-[13px] transition-all hover:bg-[#f5f6f7] ${
                  language.lang === localeVal
                    ? 'bg-[#e8f4f6] font-semibold text-[#135e6b]'
                    : 'text-[#586574]'
                }`}
                onClick={() => onSelect(language.lang)}
              >
                {language.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
