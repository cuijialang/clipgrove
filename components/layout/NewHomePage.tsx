import NewHeader from '@/components/layout/NewHeader';
import NewSidebar from '@/components/layout/NewSidebar';
import ToolCardGrid from '@/components/layout/ToolCardGrid';
import { createClient } from '@/db/supabase/client';

export default async function NewHomePage() {
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

  return (
    <div className='new-home'>
      <NewHeader />
      <div className='new-home-body'>
        <NewSidebar categories={categories} />
        <main className='new-home-main'>
          <ToolCardGrid
            tools={navigationList || []}
            categories={categories}
          />
        </main>
      </div>
    </div>
  );
}
