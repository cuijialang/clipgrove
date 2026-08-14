import { createClient } from '@/db/supabase/client';
import HomePageClient from '@/components/layout/HomePageClient';

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: categoryList }, { data: navigationList }] = await Promise.all([
    supabase.from('navigation_category').select().order('sort', { ascending: true }),
    supabase.from('web_navigation').select().order('collection_time', { ascending: false }).limit(500),
  ]);

  const categories = (categoryList || []).map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    title: cat.title || cat.name,
  }));

  const tools = navigationList || [];

  /* 热门工具：按 star_rating 排序取前 10 */
  const hotTools = [...tools]
    .sort((a, b) => (b.star_rating || 0) - (a.star_rating || 0))
    .slice(0, 10);

  /* 最新收录：按 collection_time 排序取前 12，排除已在热门中的 */
  const hotNames = new Set(hotTools.map((t) => t.name));
  const latestTools = tools.filter((t) => !hotNames.has(t.name)).slice(0, 12);

  /* 按分类分组 */
  const toolsByCategory: Record<string, typeof tools> = {};
  tools.forEach((t) => {
    const key = t.category_name || 'other';
    if (!toolsByCategory[key]) toolsByCategory[key] = [];
    toolsByCategory[key].push(t);
  });

  return (
    <HomePageClient
      hotTools={hotTools}
      latestTools={latestTools}
      categories={categories}
      toolsByCategory={toolsByCategory}
      allTools={tools}
    />
  );
}
