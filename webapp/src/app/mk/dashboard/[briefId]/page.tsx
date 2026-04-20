import { redirect, notFound } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { BriefForm } from '@/components/brief/BriefForm';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';

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


  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mk/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowRight className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">עריכת מסר</h1>
        <Link
            href={`/mks/${brief.mk_id}/briefs/${briefId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border hover:bg-muted transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            צפה בבריף
          </Link>
      </div>
      <BriefForm mkId={mkUser.mk_id} userId={user.id} brief={brief} />
    </div>
  );
}
