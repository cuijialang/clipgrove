import { CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';

function TitleItem({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='flex items-center gap-2 text-lg font-semibold text-white/80'>
      <CircleHelp className='size-5 text-primary/60' /> {children}
    </h3>
  );
}

function ContentItem({ children }: { children: React.ReactNode }) {
  return <p className='mt-2 text-sm leading-relaxed text-white/40'>{children}</p>;
}

export default function Faq() {
  const t = useTranslations('Faq');
  return (
    <div className='mx-auto max-w-pc space-y-8 pb-10'>
      <h2 className='section-title justify-center text-center text-2xl font-bold text-white lg:pb-3 lg:text-3xl'>
        <span>{t('title')}</span>
      </h2>
      <div className='grid grid-cols-1 gap-6 px-3 lg:grid-cols-2 lg:gap-12 lg:px-0'>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('1.question')}</TitleItem>
          <ContentItem>{t('1.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('2.question')}</TitleItem>
          <ContentItem>{t('2.answer-1')}</ContentItem>
          <ContentItem>{t('2.answer-2')}</ContentItem>
          <ContentItem>{t('2.answer-3')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('3.question')}</TitleItem>
          <ContentItem>{t('3.answer-1')}</ContentItem>
          <ContentItem>{t('3.answer-2')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('4.question')}</TitleItem>
          <ContentItem>{t('4.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('5.question')}</TitleItem>
          <ContentItem>{t('5.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('6.question')}</TitleItem>
          <ContentItem>{t('6.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('7.question')}</TitleItem>
          <ContentItem>{t('7.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('8.question')}</TitleItem>
          <ContentItem>{t('8.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('9.question')}</TitleItem>
          <ContentItem>{t('9.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('10.question')}</TitleItem>
          <ContentItem>{t('10.answer')}</ContentItem>
        </div>
        <div className='glass-card rounded-xl p-5'>
          <TitleItem>{t('11.question')}</TitleItem>
          <ContentItem>{t('11.answer')}</ContentItem>
        </div>
      </div>
    </div>
  );
}
