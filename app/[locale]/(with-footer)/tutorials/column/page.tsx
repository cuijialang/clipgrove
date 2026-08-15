import InfoPageShell from '@/components/layout/InfoPageShell';

export default function TutorialsSubPage() {
  return (
    <InfoPageShell title='AI教程资源' description='系统学习 AI 技能与工具使用'>
      <div className='info-page-empty'>
        <div className='info-page-empty-icon'>📚</div>
        <p className='info-page-empty-title'>教程内容建设中</p>
        <p className='info-page-empty-desc'>热门 AI 教程、专栏与百科内容将在这里呈现，敬请期待。</p>
      </div>
    </InfoPageShell>
  );
}
