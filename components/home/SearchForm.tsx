'use client';

/* eslint-disable react/jsx-props-no-spreading */
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  search: z.string(),
});

export default function SearchForm({ defaultSearch }: { defaultSearch?: string }) {
  const t = useTranslations('Home');
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: defaultSearch || '',
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    if (!data.search.trim()) return;
    router.push(`/query/${data.search}`);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name='search'
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className='group relative flex w-full items-center text-white/40'>
                  <div className='pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 opacity-0 transition-all duration-300 group-focus-within:opacity-100' />
                  <Input
                    placeholder={t('search')}
                    {...field}
                    className='relative h-8 w-full rounded-full border border-white/20 !bg-[#1a1d2e] pr-10 placeholder:text-white/30 transition-all duration-300 focus:border-primary/30 focus:shadow-[0_0_20px_hsl(var(--primary)/0.1)] lg:h-[38px] lg:w-[392px] lg:pr-12'
                  />
                  <Separator className='absolute right-8 h-6 w-px bg-white/20 lg:right-10' orientation='vertical' />
                  <button type='submit' className='absolute right-2 transition-colors hover:text-white lg:right-3'>
                    <Search className='size-[18px] lg:size-5' />
                    <span className='sr-only'>search</span>
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
