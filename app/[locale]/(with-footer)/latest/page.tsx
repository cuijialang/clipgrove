import InfoPageShell from '@/components/layout/InfoPageShell';

export default function LatestProjectsPage() {
  return (
    <InfoPageShell title='最新AI项目' description='发现最新开源的 AI 项目与框架'>
      <div className='info-page-empty'>
        <div className='info-page-empty-icon'>🚀</div>
        <p className='info-page-empty-title'>项目内容建设中</p>
        <p className='info-page-empty-desc'>最新 AI 项目与开源框架将在这里呈现，敬请期待。</p>
      </div>
    </InfoPageShell>
  );
}
