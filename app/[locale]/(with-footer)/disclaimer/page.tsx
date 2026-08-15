import InfoPageShell from '@/components/layout/InfoPageShell';

export default function DisclaimerPage() {
  return (
    <InfoPageShell title='免责声明' description='使用本站内容前请仔细阅读'>
      <div className='prose mx-auto w-full p-4 text-gray-200 prose-headings:text-gray-200'>
        <h2>内容说明</h2>
        <p>
          本站收录的 AI 工具信息来源于公开渠道，仅供学习与参考。工具名称、Logo、官网及功能介绍
          均归其对应公司或开发者所有。
        </p>
        <h2>链接与第三方</h2>
        <p>
          本站中的外链指向第三方网站，其内容与行为由第三方负责，本站不对其作出任何担保，
          也不承担因使用第三方产品或服务产生的任何责任。
        </p>
        <h2>信息准确性</h2>
        <p>
          AI 工具更新迭代较快，本站展示的信息可能存在滞后，建议以各工具官方页面为准。 如发现信息有误，欢迎联系我们更正。
        </p>
      </div>
    </InfoPageShell>
  );
}
