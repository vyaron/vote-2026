import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { BriefForm } from '@/components/brief/BriefForm';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function NewBriefPage() {
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

  return (
    <div className="container py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/mk/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowRight className="h-4 w-4" />
        </Link>
        <h1 className="text-2xl font-bold">מסר חדש</h1>
      </div>
      <BriefForm mkId={mkUser.mk_id} userId={user.id} />
    </div>
  );
}
