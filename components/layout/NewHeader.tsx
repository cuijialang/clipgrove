/* eslint-disable @next/next/no-img-element */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

const ENGINES = [
  { key: 'site', label: '站内' },
  { key: 'bing', label: 'Bing' },
  { key: 'baidu', label: '百度' },
  { key: 'google', label: 'Google' },
];

export default function NewHeader() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeEngine, setActiveEngine] = useState('site');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    if (activeEngine === 'site') {
      router.push(`/query/${encodeURIComponent(q)}`);
    } else if (activeEngine === 'bing') {
      window.open(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, '_blank');
    } else if (activeEngine === 'baidu') {
      window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(q)}`, '_blank');
    } else if (activeEngine === 'google') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
    }
  }, [query, activeEngine, router]);

  return (
    <header className='new-header'>
      <div className='new-header-inner'>
        {/* Logo */}
        <Link href='/' className='new-header-logo'>
          <img src='/images/clipgrove-logo.svg' alt='ClipGrove' className='size-9' />
          <span className='new-header-logo-text'>ClipGrove</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className='new-header-search-wrap'>
          <div className='new-header-search'>
            <Search className='size-4 text-[#9ca3af]' />
            <input
              type='text'
              className='new-header-search-input'
              placeholder='搜索 AI 工具...'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button type='button' className='p-0.5' onClick={() => setQuery('')}>
                <X className='size-3.5 text-[#9ca3af]' />
              </button>
            )}
          </div>
          <div className='new-header-engine-tabs'>
            {ENGINES.map((eng) => (
              <button
                key={eng.key}
                type='button'
                className={`new-header-engine-tab ${activeEngine === eng.key ? 'active' : ''}`}
                onClick={() => setActiveEngine(eng.key)}
              >
                {eng.label}
              </button>
            ))}
          </div>
        </form>

        {/* Right links */}
        <div className='new-header-links'>
          <Link href='/submit' className='new-header-link'>提交工具</Link>
          <Link href='/explore' className='new-header-link'>探索</Link>
        </div>
      </div>
    </header>
  );
}
