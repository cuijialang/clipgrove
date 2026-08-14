'use client';

/* eslint-disable @next/next/no-img-element */

import { useState } from 'react';

/**
 * Generate multiple favicon fallback URLs from a website URL.
 * DuckDuckGo and direct favicon.ico are more likely to be accessible in China.
 */
function getFaviconUrls(url: string): string[] {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname;
    return [
      `https://${domain}/favicon.ico`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://favicon.im/${domain}?size=64`,
    ];
  } catch {
    return [];
  }
}

interface ToolIconProps {
  src: string | null | undefined;
  alt: string;
  emoji: string;
  websiteUrl?: string;
  className?: string;
}

export default function ToolIcon({
  src,
  alt,
  emoji,
  websiteUrl,
  className,
}: ToolIconProps) {
  // Build initial source: prefer stored thumbnail, then first favicon fallback
  const initialSrc = (() => {
    if (src) return src;
    if (websiteUrl) {
      const urls = getFaviconUrls(websiteUrl);
      return urls[0] || null;
    }
    return null;
  })();

  const [imgSrc, setImgSrc] = useState<string | null>(initialSrc);
  const [errorCount, setErrorCount] = useState(0);

  // If no image source at all, show emoji immediately
  if (!imgSrc) {
    return <span className={`fallback-icon ${className || ''}`}>{emoji}</span>;
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading='lazy'
      onError={() => {
        const next = errorCount + 1;
        setErrorCount(next);

        // Try next fallback URL from the website URL
        if (websiteUrl) {
          const urls = getFaviconUrls(websiteUrl);
          // First error: was trying thumbnail_url, now try favicon sequence
          if (imgSrc === src && urls.length > 0) {
            setImgSrc(urls[0]);
            return;
          }
          // Subsequent errors: try next favicon URL in the list
          const currentIdx = urls.indexOf(imgSrc);
          if (currentIdx >= 0 && currentIdx < urls.length - 1) {
            setImgSrc(urls[currentIdx + 1]);
            return;
          }
        }

        // All attempts exhausted — show emoji
        setImgSrc(null);
      }}
    />
  );
}
