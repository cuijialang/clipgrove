import InfoPageShell from '@/components/layout/InfoPageShell';

export default function WikiPage() {
  return (
    <InfoPageShell title='AI百科' description='AI 概念与术语知识库'>
      <div className='info-page-empty'>
        <div className='info-page-empty-icon'>💡</div>
        <p className='info-page-empty-title'>百科内容建设中</p>
        <p className='info-page-empty-desc'>AI 名词解释与科普文章将在这里呈现，敬请期待。</p>
      </div>
    </InfoPageShell>
  );
}
