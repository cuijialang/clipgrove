import Link from 'next/link';

export function TagItem({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <div
      className={`flex h-[38px] items-center justify-center gap-[2px] whitespace-nowrap rounded-full px-4 text-xs font-medium transition-all duration-300 ${
        active
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'tag-glass text-white/60'
      }`}
    >
      {children}
    </div>
  );
}

export function TagLink({ name, href }: { name: string; href: string }) {
  return (
    <Link href={href} title={name}>
      <TagItem>{name}</TagItem>
    </Link>
  );
}

export function TagList({ data }: { data: { name: string; href: string; id: string }[] }) {
  return (
    <ul className='no-scrollbar flex max-w-full flex-1 items-center gap-3 overflow-auto'>
      {data.map((item) => (
        <li key={item.href}>
          <TagLink name={item.name} href={item.href} />
        </li>
      ))}
    </ul>
  );
}
