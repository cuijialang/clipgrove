import InfoPageShell from '@/components/layout/InfoPageShell';

export default function CommunityPage() {
  return (
    <InfoPageShell title='AI交流群' description='加入 AI 社群，一起交流与成长'>
      <div className='prose mx-auto w-full p-4 text-gray-200 prose-headings:text-gray-200'>
        <h2>关于交流群</h2>
        <p>
          AI交流群是面向 AI 爱好者与从业者的社群，你可以在这里交流 AI 工具使用心得、 分享最新 AI
          动态、互助解答问题，并第一时间获取我们收录的新工具。
        </p>
        <h2>加入方式</h2>
        <p>
          欢迎通过邮件联系管理员获取入群方式：
          <a href='mailto:jialangcui@163.com' className='text-blue-400 underline'>
            jialangcui@163.com
          </a>
        </p>
        <h2>群规</h2>
        <ul>
          <li>文明交流，禁止广告刷屏</li>
          <li>尊重每一位成员，禁止人身攻击</li>
          <li>禁止发布违法违规及侵权内容</li>
        </ul>
      </div>
    </InfoPageShell>
  );
}
