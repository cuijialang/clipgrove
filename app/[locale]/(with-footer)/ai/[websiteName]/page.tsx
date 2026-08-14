import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/db/supabase/client';
import { getTranslations } from 'next-intl/server';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteSidebar from '@/components/layout/SiteSidebar';
import DetailPage from '@/components/layout/DetailPage';

export async function generateMetadata({
  params: { locale, websiteName },
}: {
  params: { locale: string; websiteName: string };
}): Promise<Metadata> {
  const supabase = createClient();
  const t = await getTranslations({ locale, namespace: 'Metadata.ai' });
  const { data } = await supabase.from('web_navigation').select().eq('name', websiteName);
  if (!data || !data[0]) notFound();
  return {
    title: `${data[0].title} | ${t('titleSubfix')}`,
    description: data[0].content,
  };
}

export default async function Page({ params: { websiteName } }: { params: { websiteName: string } }) {
  const supabase = createClient();
  const { data: dataList } = await supabase.from('web_navigation').select().eq('name', websiteName);
  if (!dataList || !dataList[0]) notFound();
  const tool = dataList[0];

  const { data: categoryList } = await supabase
    .from('navigation_category')
    .select()
    .order('sort', { ascending: true });

  const categories = (categoryList || []).map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    title: cat.title || cat.name,
  }));

  const currentCat = categories.find((c) => c.name === tool.category_name);
  const categoryTitle = currentCat?.title || tool.category_name || '';

  const { data: relatedList } = await supabase
    .from('web_navigation')
    .select()
    .eq('category_name', tool.category_name || '')
    .neq('name', websiteName)
    .limit(6);

  return (
    <div className='site-wrap'>
      <SiteHeader />
      <div className='site-body'>
        <SiteSidebar categories={categories} />
        <main className='site-main'>
          <DetailPage
            tool={tool}
            categoryTitle={categoryTitle}
            relatedTools={relatedList || []}
          />
        </main>
      </div>
    </div>
  );
}
