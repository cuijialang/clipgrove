import { createClient } from '@/db/supabase/client';

import SiteHeader from '@/components/layout/SiteHeader';
import SiteSidebar from '@/components/layout/SiteSidebar';

interface InfoPageShellProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export default async function InfoPageShell({ title, description, children }: InfoPageShellProps) {
  const supabase = createClient();
  const { data: allCategories } = await supabase
    .from('navigation_category')
    .select()
    .order('sort', { ascending: true });

  const categories = (allCategories || []).map((cat) => ({
    id: String(cat.id),
    name: cat.name,
    title: cat.title || cat.name,
  }));

  return (
    <div className='site-wrap'>
      <SiteHeader />
      <div className='site-body'>
        <SiteSidebar categories={categories} />
        <main className='site-main'>
          {title && (
            <div className='info-page-hero'>
              <h1 className='info-page-title'>{title}</h1>
              {description && <p className='info-page-desc'>{description}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
