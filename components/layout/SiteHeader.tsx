'use client';

/* eslint-disable @next/next/no-img-element */

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';

const ENGINES = [
  { key: 'site', label: '站内' },
  { key: 'bing', label: 'Bing' },
  { key: 'baidu', label: '百度' },
  { key: 'google', label: 'Google' },
  { key: 'perplexity', label: 'Perplexity' },
  { key: 'you', label: 'YOU' },
  { key: 'qihoo', label: '360' },
  { key: 'sogou', label: '搜狗' },
  { key: 'shenma', label: '神马' },
];

const COMMUNITY_LINKS = [
  { label: 'Hugging Face', href: 'https://huggingface.co/' },
  { label: 'GitHub', href: 'https://github.com/' },
  { label: '飞桨', href: 'https://www.paddlepaddle.org.cn/' },
  { label: '魔搭', href: 'https://modelscope.cn/' },
  { label: '和鲸', href: 'https://www.heywhale.com/' },
  { label: '掘金', href: 'https://juejin.cn/' },
  { label: '知乎', href: 'https://www.zhihu.com/' },
];

const IMAGE_LINKS = [
  { label: '文心一格', href: 'https://yige.baidu.com/' },
  { label: '花瓣AI圈', href: 'https://huaban.com/' },
  { label: 'Civitai', href: 'https://civitai.com/' },
  { label: 'OpenArt', href: 'https://openart.ai/' },
  { label: 'NightCafe', href: 'https://creator.nightcafe.studio/' },
  { label: 'DeviantArt', href: 'https://www.deviantart.com/' },
  { label: 'Lexica', href: 'https://lexica.art/' },
];

const LIFE_LINKS = [
  { label: '淘宝', href: 'https://www.taobao.com/' },
  { label: '京东', href: 'https://www.jd.com/' },
  { label: '下厨房', href: 'https://www.xiachufang.com/' },
  { label: '香哈菜谱', href: 'https://www.xiangha.com/' },
  { label: '12306', href: 'https://www.12306.cn/' },
  { label: '快递100', href: 'https://www.kuaidi100.com/' },
  { label: '去哪儿', href: 'https://www.qunar.com/' },
];

const AI_TOOLS_DROPDOWN = [
  { label: 'AI写作工具', href: '/category/ai-writing' },
  { label: 'AI图像工具', href: '/category/ai-image' },
  { label: 'AI视频工具', href: '/category/ai-video' },
  { label: 'AI办公工具', href: '/category/ai-office' },
  { label: 'AI智能体', href: '/category/ai-agent' },
  { label: 'AI聊天助手', href: '/category/ai-chat' },
  { label: 'AI编程工具', href: '/category/ai-coding' },
  { label: 'AI设计工具', href: '/category/ai-design' },
  { label: 'AI音频工具', href: '/category/ai-audio' },
  { label: 'AI搜索引擎', href: '/category/ai-search' },
  { label: 'AI开发平台', href: '/category/ai-platform' },
  { label: 'AI学习网站', href: '/category/ai-learning' },
  { label: 'AI训练模型', href: '/category/ai-model' },
  { label: 'AI内容检测', href: '/category/ai-detection' },
  { label: 'AI提示指令', href: '/category/ai-prompt' },
];

const LATEST_DROPDOWN = [
  { label: 'AI工具', href: '/latest/tools' },
  { label: 'AI项目和框架', href: '/latest/projects' },
];

const TUTORIALS_DROPDOWN = [
  { label: 'AI专栏', href: '/tutorials/column' },
  { label: 'AI问答', href: '/tutorials/qa' },
  { label: 'AI百科', href: '/tutorials/wiki' },
  { label: 'AI名人堂', href: '/tutorials/hall-of-fame' },
];

export default function SiteHeader() {
  const [query, setQuery] = useState('');
  const [activeEngine, setActiveEngine] = useState('site');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const q = query.trim();
      if (!q) return;

      if (activeEngine === 'site') {
        window.location.href = `/query/${encodeURIComponent(q)}`;
      } else if (activeEngine === 'bing') {
        window.open(`https://www.bing.com/search?q=${encodeURIComponent(q)}`, '_blank');
      } else if (activeEngine === 'baidu') {
        window.open(`https://www.baidu.com/s?wd=${encodeURIComponent(q)}`, '_blank');
      } else if (activeEngine === 'google') {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
      } else if (activeEngine === 'perplexity') {
        window.open(`https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`, '_blank');
      } else if (activeEngine === 'you') {
        window.open(`https://you.com/search?q=${encodeURIComponent(q)}`, '_blank');
      } else if (activeEngine === 'qihoo') {
        window.open(`https://www.so.com/s?q=${encodeURIComponent(q)}`, '_blank');
      } else if (activeEngine === 'sogou') {
        window.open(`https://www.sogou.com/web?query=${encodeURIComponent(q)}`, '_blank');
      } else if (activeEngine === 'shenma') {
        window.open(`https://m.sm.cn/s?q=${encodeURIComponent(q)}`, '_blank');
      }
    },
    [query, activeEngine],
  );

  const handleDropdownEnter = useCallback((key: string) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setOpenDropdown(key);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    dropdownTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  }, []);

  const handleDropdownItemEnter = useCallback((key: string) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
      dropdownTimerRef.current = null;
    }
    setOpenDropdown(key);
  }, []);

  return (
    <header className='site-header'>
      <div className='header-inner'>
        <Link href='/' className='header-logo'>
          <span className='header-logo-icon'>AI</span>
          <span className='header-logo-text'>AI工具集</span>
        </Link>

        <form onSubmit={handleSearch} className='header-search-wrap'>
          <div className='header-search-box'>
            <Search size={16} />
            <input
              ref={inputRef}
              type='text'
              className='header-search-input'
              placeholder='站内AI工具搜索'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type='button'
                className='header-search-clear'
                onClick={() => setQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className='header-search-engines'>
            {ENGINES.map((eng) => (
              <button
                key={eng.key}
                type='button'
                className={`header-search-engine ${activeEngine === eng.key ? 'active' : ''}`}
                onClick={() => setActiveEngine(eng.key)}
              >
                {eng.label}
              </button>
            ))}
          </div>

          {/* Community Links Row */}
          <div className='header-sub-nav'>
            {COMMUNITY_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='header-sub-nav-link'
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Image Community Links Row */}
          <div className='header-sub-nav'>
            {IMAGE_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='header-sub-nav-link'
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Life Links Row */}
          <div className='header-sub-nav'>
            {LIFE_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target='_blank'
                rel='noopener noreferrer'
                className='header-sub-nav-link'
              >
                {link.label}
              </a>
            ))}
          </div>
        </form>

        <nav className='header-nav'>
          {/* AI工具集 Dropdown */}
          <div
            className='header-nav-item'
            onMouseEnter={() => handleDropdownEnter('ai-tools')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link href='/' className='header-nav-link'>
              AI工具集
            </Link>
            {openDropdown === 'ai-tools' && (
              <div
                className='header-nav-dropdown'
                onMouseEnter={() => handleDropdownItemEnter('ai-tools')}
                onMouseLeave={handleDropdownLeave}
              >
                {AI_TOOLS_DROPDOWN.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className='header-nav-dropdown-item'
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AI应用集 */}
          <Link href='/explore' className='header-nav-link'>
            AI应用集
          </Link>

          {/* 每日AI资讯 */}
          <Link href='/daily-news' className='header-nav-link'>
            每日AI资讯
          </Link>

          {/* 最新AI项目 Dropdown */}
          <div
            className='header-nav-item'
            onMouseEnter={() => handleDropdownEnter('latest')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link href='/latest' className='header-nav-link'>
              最新AI项目
            </Link>
            {openDropdown === 'latest' && (
              <div
                className='header-nav-dropdown'
                onMouseEnter={() => handleDropdownItemEnter('latest')}
                onMouseLeave={handleDropdownLeave}
              >
                {LATEST_DROPDOWN.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className='header-nav-dropdown-item'
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AI教程资源 Dropdown */}
          <div
            className='header-nav-item'
            onMouseEnter={() => handleDropdownEnter('tutorials')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link href='/tutorials' className='header-nav-link'>
              AI教程资源
            </Link>
            {openDropdown === 'tutorials' && (
              <div
                className='header-nav-dropdown'
                onMouseEnter={() => handleDropdownItemEnter('tutorials')}
                onMouseLeave={handleDropdownLeave}
              >
                {TUTORIALS_DROPDOWN.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className='header-nav-dropdown-item'
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 广告合作 */}
          <Link href='/advertise' className='header-nav-link'>
            广告合作
          </Link>

          {/* 关于我们 */}
          <Link href='/about' className='header-nav-link'>
            关于我们
          </Link>
        </nav>
      </div>
    </header>
  );
}
