import InfoPageShell from '@/components/layout/InfoPageShell';

export default function AboutPage() {
  return (
    <InfoPageShell title='关于我们' description='了解 AI工具集（ClipGrove）'>
      <div className='prose mx-auto w-full p-4 text-gray-200 prose-headings:text-gray-200'>
        <h2>关于 AI工具集</h2>
        <p>
          AI工具集是一个专注收录国内外优质 AI 工具的导航平台，每日更新并添加最新 AI 工具， 同时推荐 AI
          学习与开发常用的网站、框架和模型，帮助你快速找到合适的 AI 工具， 加入人工智能浪潮，自动化、高效地完成任务。
        </p>
        <h2>我们的目标</h2>
        <p>
          让每一位访客都能在最短时间内找到合适的 AI 工具。我们坚持人工审核与分类整理，
          确保收录的工具真实可用、分类清晰、描述准确，并提供详细的工具介绍与使用指引。
        </p>
        <h2>联系我们</h2>
        <p>
          如需提交工具、反馈建议或洽谈合作，欢迎通过邮件联系我们：
          <a href='mailto:jialangcui@163.com' className='text-blue-400 underline'>
            jialangcui@163.com
          </a>
        </p>
      </div>
    </InfoPageShell>
  );
}
