import InfoPageShell from '@/components/layout/InfoPageShell';

export default function DailyNewsPage() {
  return (
    <InfoPageShell title='每日AI资讯' description='每日更新的 AI 行业动态与资讯'>
      <div className='info-page-empty'>
        <div className='info-page-empty-icon'>📰</div>
        <p className='info-page-empty-title'>资讯内容建设中</p>
        <p className='info-page-empty-desc'>每日 AI 快讯与热门动态将在这里呈现，敬请期待。</p>
      </div>
    </InfoPageShell>
  );
}
