import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { BriefForm } from '@/components/brief/BriefForm';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { SourceMeta } from '@/lib/supabase/types';

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function parseFeedContext(params: Record<string, string | string[] | undefined>): SourceMeta | null {
  if (params.source !== 'feed') return null;
  const str = (key: string) => {
    const v = params[key];
    return typeof v === 'string' ? v : '';
  };
  const id = str('sourceId');
  const url = str('sourceUrl');
  const title = str('sourceTitle');
  if (!id || !url || !title) return null;
  return {
    type: 'feed_item',
    name: str('sourceName') || 'מעריב',
    url,
    item_id: id,
    title,
    excerpt: str('sourceSummary'),
    published_at: str('sourcePublishedAt') || new Date().toISOString(),
  };
}

export default async function NewBriefPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const service = createServiceClient();
  const { data: mkUser } = await service
    .from('mk_users')
    .select('mk_id')
    .eq('user_id', user.id)
    .single();

  if (!mkUser) redirect('/');

  const params = await searchParams;
  const feedContext = parseFeedContext(params);
  const feedImageUrl = feedContext
    ? (typeof params.sourceImageUrl === 'string' ? params.sourceImageUrl : null)
    : null;

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mk/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowRight className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">מסר חדש</h1>
      </div>
      <BriefForm mkId={mkUser.mk_id} userId={user.id} feedContext={feedContext ?? undefined} feedImageUrl={feedImageUrl ?? undefined} />
    </div>
  );
}
