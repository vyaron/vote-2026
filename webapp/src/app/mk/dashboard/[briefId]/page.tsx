import { redirect, notFound } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { BriefForm } from '@/components/brief/BriefForm';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Eye, EyeOff } from 'lucide-react';
import type { BriefStatus } from '@/lib/supabase/types';

interface Props {
  params: Promise<{ briefId: string }>;
}

export default async function EditBriefPage({ params }: Props) {
  const { briefId } = await params;
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

  const { data: brief } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', briefId)
    .eq('mk_id', mkUser.mk_id)
    .single();

  if (!brief || brief.status === 'deleted') notFound();

  async function toggleStatus() {
    'use server';
    const sb = await createClient();
    const newStatus: BriefStatus = brief!.status === 'published' ? 'draft' : 'published';
    await sb.from('briefs').update({ status: newStatus }).eq('id', briefId);
    redirect(`/mk/dashboard/${briefId}`);
  }

  const { data: briefMedia } = await supabase
    .from('brief_media')
    .select('*')
    .eq('brief_id', briefId)
    .order('sort_order');

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mk/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowRight className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">עריכת מסר</h1>
        <form action={toggleStatus}>
          <button
            type="submit"
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
              brief.status === 'published'
                ? 'border-muted hover:bg-muted text-muted-foreground'
                : 'border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500/20'
            }`}
          >
            {brief.status === 'published' ? (
              <><EyeOff className="h-4 w-4" />הסר מפרסום</>
            ) : (
              <><Eye className="h-4 w-4" />פרסם עכשיו</>
            )}
          </button>
        </form>
        <Link
            href={`/mk/dashboard/${briefId}/view`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            צפה בבריף
          </Link>
      </div>
      <BriefForm mkId={mkUser.mk_id} userId={user.id} brief={brief} initialMedia={briefMedia ?? []} />
    </div>
  );
}
