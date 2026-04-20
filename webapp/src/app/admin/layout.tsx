import Link from 'next/link';
import { createServiceClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, FileText } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/admin');

  const service = createServiceClient();
  const { data: mkUser } = await service
    .from('mk_users')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // Non-admin gets home, not login (avoids middleware redirect loop)
  if (!mkUser || mkUser.role !== 'admin') redirect('/');

  return (
    <div className="min-h-screen">
      <div className="border-b bg-card">
        <div className="container flex items-center gap-6 py-3">
          <span className="font-bold text-sm">ניהול</span>
          <Link href="/admin/mks" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Users className="h-4 w-4" />
            חברי כנסת
          </Link>
          <Link href="/admin/briefs" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <FileText className="h-4 w-4" />
            מסרים
          </Link>
        </div>
      </div>
      <div className="container py-8">{children}</div>
    </div>
  );
}
