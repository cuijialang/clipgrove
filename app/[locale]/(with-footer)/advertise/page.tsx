import InfoPageShell from '@/components/layout/InfoPageShell';

export default function AdvertisePage() {
  return (
    <InfoPageShell title='广告合作' description='与 AI工具集建立合作，触达海量 AI 用户'>
      <div className='prose mx-auto w-full p-4 text-gray-200 prose-headings:text-gray-200'>
        <h2>为什么选择我们</h2>
        <p>
          AI工具集（ClipGrove）聚焦 AI 工具与开发者人群，站内访客以 AI 产品使用者、
          创业者与工程师为主。在此投放广告或合作，可将你的产品精准触达目标用户。
        </p>
        <h2>合作方式</h2>
        <ul>
          <li>首页及分类页横幅广告</li>
          <li>工具推荐位与置顶收录</li>
          <li>内容合作与专题共建</li>
          <li>活动与线上发布会合作</li>
        </ul>
        <h2>联系我们</h2>
        <p>
          广告与商务合作请通过邮件洽谈：
          <a href='mailto:jialangcui@163.com' className='text-blue-400 underline'>
            jialangcui@163.com
          </a>
        </p>
      </div>
    </InfoPageShell>
  );
}
