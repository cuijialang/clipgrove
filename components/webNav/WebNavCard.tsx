/* eslint-disable react/jsx-no-target-blank */

import Link from 'next/link';
import { WebNavigation } from '@/db/supabase/types';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ToolIcon from '@/components/layout/ToolIcon';

function getPricingLabel(websiteData: string): { label: string; type: string } {
  try {
    const data = JSON.parse(websiteData);
    const pricing = (data?.pricing || '').toLowerCase();
    if (pricing.includes('free')) return { label: 'Free', type: 'free' };
    if (pricing.includes('freemium')) return { label: 'Freemium', type: 'freemium' };
    if (pricing.includes('subscription')) return { label: 'Subscription', type: 'subscription' };
    return { label: 'Paid', type: 'paid' };
  } catch {
    return { label: '', type: '' };
  }
}

function getPlatformLabel(websiteData: string): string {
  try {
    const data = JSON.parse(websiteData);
    return data?.platform || '';
  } catch {
    return '';
  }
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 0; i < 5; i += 1) {
    let fill = '';
    if (rating >= i + 1) {
      fill = 'filled';
    } else if (rating >= i + 0.5) {
      fill = 'half';
    }
    stars.push(
      <span key={i} className={`star ${fill}`}>
        ★
      </span>,
    );
  }
  return <span className='star-rating'>{stars}</span>;
}

export default function WebNavCard({
  name,
  thumbnail_url,
  title,
  url,
  content,
  star_rating,
  website_data,
  tag_name,
}: WebNavigation) {
  const t = useTranslations('Home');
  const pricing = getPricingLabel(website_data || '{}');
  const platform = getPlatformLabel(website_data || '{}');
  const tags = (tag_name || '').split(',').filter(Boolean);

  return (
    <div className='card-glow group relative flex flex-col overflow-hidden rounded-xl border border-white/5 bg-[#1a1d2e] lg:h-[360px]'>
      {/* Image section */}
      <Link href={`/ai/${name}`} title={title} className='relative block overflow-hidden'>
        <div className='aspect-[310/174] w-full bg-gradient-to-br from-[#1e2140] to-[#2a1f3a] webnav-card-img'>
          <ToolIcon
            src={thumbnail_url || null}
            alt={title || ''}
            emoji='📦'
            websiteUrl={url}
            className='aspect-[310/174] w-full object-cover transition-all duration-500 group-hover:scale-105'
          />
        </div>
        {/* Gradient overlay on hover */}
        <div className='absolute inset-0 flex items-center justify-center bg-gradient-to-t from-[#1a1d2e]/90 via-transparent to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100'>
          <span className='rounded-full border border-white/30 px-4 py-1.5 text-xs text-white backdrop-blur-sm transition-all hover:bg-white/10'>
            {t('checkDetail')} →
          </span>
        </div>
        {/* Pricing badge */}
        {pricing.label && (
          <span className={`pricing-badge ${pricing.type} absolute left-2 top-2`}>
            {pricing.label}
          </span>
        )}
        {/* Platform badge */}
        {platform && (
          <span className='absolute right-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-white/60 backdrop-blur-sm'>
            {platform}
          </span>
        )}
      </Link>

      {/* Content section */}
      <div className='flex flex-1 flex-col gap-1.5 px-3 pb-3 pt-2.5'>
        {/* Title row */}
        <div className='flex items-center justify-between'>
          <a href={url} title={title} target='_blank' rel='nofollow' className='hover:opacity-70'>
            <h3 className='line-clamp-1 text-sm font-bold text-white lg:text-base'>{title}</h3>
          </a>
          <a href={url} title={title} target='_blank' rel='nofollow' className='shrink-0 hover:opacity-70'>
            <SquareArrowOutUpRight className='size-4 text-white/40' />
            <span className='sr-only'>{title}</span>
          </a>
        </div>

        {/* Description */}
        <p className='line-clamp-2 text-xs leading-relaxed text-white/50 lg:line-clamp-3 lg:text-sm'>{content}</p>

        {/* Bottom row: rating + tags */}
        <div className='mt-auto flex items-center justify-between gap-2'>
          {star_rating != null && star_rating > 0 && (
            <div className='flex items-center gap-1.5'>
              <StarRating rating={star_rating} />
              <span className='text-[10px] text-white/30'>{star_rating}/10</span>
            </div>
          )}
          <div className='flex flex-wrap gap-1'>
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className='rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/35'
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
