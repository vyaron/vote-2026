import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Plus, FileText, Eye, EyeOff, Trash2, RotateCcw, Clock, ExternalLink } from 'lucide-react';
import type { Database, BriefStatus } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { getMkServer } from '@/lib/mk-server';
import { getMkSlug } from '@/lib/slugs';

type Brief = Database['public']['Tables']['briefs']['Row'];
type BriefUpdate = Database['public']['Tables']['briefs']['Update'];

const STATUS_LABEL: Record<string, string> = {
  draft: 'טיוטה',
  published: 'פורסם',
  deleted: 'נמחק',
};

const STATUS_CLASS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-500/10 text-green-600',
  deleted: 'bg-destructive/10 text-destructive',
};

async function setBriefStatus(briefId: string, status: BriefStatus) {
  'use server';
  const supabase = await createClient();
  const update: BriefUpdate =
    status === 'deleted'
      ? { status, deleted_at: new Date().toISOString() }
      : { status, deleted_at: null };
  await supabase.from('briefs').update(update).eq('id', briefId);
  redirect('/mk/dashboard');
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login?next=/mk/dashboard');

  const service = createServiceClient();
  const { data: mkUser } = await service
    .from('mk_users')
    .select('mk_id')
    .eq('user_id', user.id)
    .single();

  // Don't redirect to /auth/login here — that would create a middleware loop.
  // If mkUser is missing, the account isn't set up yet.
  if (!mkUser) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        <p className="font-medium">החשבון שלך טרם הוגדר.</p>
        <p className="text-sm mt-2">פנה למנהל המערכת.</p>
      </div>
    );
  }

  const [{ data: briefs }, mk] = await Promise.all([
    supabase
      .from('briefs')
      .select('*')
      .eq('mk_id', mkUser.mk_id)
      .order('created_at', { ascending: false }),
    getMkServer(String(mkUser.mk_id)),
  ]);

  const mkSlug = mk ? getMkSlug(mk.id, mk.name) : String(mkUser.mk_id);

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">המסרים שלי</h1>
          <p className="text-muted-foreground text-sm mt-1">נהל את המסרים שלך לתקשורת ולציבור</p>
        </div>
        <Link
          href="/mk/dashboard/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          מסר חדש
        </Link>
      </div>

      {!briefs || briefs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-2xl">
          <FileText className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>אין מסרים עדיין</p>
          <Link href="/mk/dashboard/new" className="mt-4 inline-block text-primary font-medium hover:underline text-sm">
            צור את המסר הראשון שלך
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {briefs.map((brief) => (
            <div key={brief.id} className="bg-card border rounded-xl p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_CLASS[brief.status])}>
                    {STATUS_LABEL[brief.status]}
                  </span>
                  {brief.publish_at && brief.status === 'draft' && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      מתוזמן ל-{new Date(brief.publish_at).toLocaleDateString('he-IL')}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold truncate">{brief.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(brief.created_at).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}
                  {brief.template === 'statement' ? 'הצהרה' : 'פוסט מדיה'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {brief.status !== 'deleted' && mkSlug && (
                  <Link
                    href={`/mks/${mkSlug}/briefs/${brief.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="צפה בבריף"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
                {brief.status !== 'deleted' && (
                  <Link
                    href={`/mk/dashboard/${brief.id}`}
                    className="p-2 hover:bg-muted rounded-lg transition-colors text-sm"
                    title="ערוך"
                  >
                    <FileText className="h-4 w-4" />
                  </Link>
                )}

                {brief.status === 'draft' && (
                  <form action={setBriefStatus.bind(null, brief.id, 'published')}>
                    <button type="submit" className="p-2 hover:bg-muted rounded-lg transition-colors" title="פרסם">
                      <Eye className="h-4 w-4 text-green-600" />
                    </button>
                  </form>
                )}

                {brief.status === 'published' && (
                  <form action={setBriefStatus.bind(null, brief.id, 'draft')}>
                    <button type="submit" className="p-2 hover:bg-muted rounded-lg transition-colors" title="הסר מפרסום">
                      <EyeOff className="h-4 w-4" />
                    </button>
                  </form>
                )}

                {brief.status === 'deleted' ? (
                  <form action={setBriefStatus.bind(null, brief.id, 'draft')}>
                    <button type="submit" className="p-2 hover:bg-muted rounded-lg transition-colors" title="שחזר">
                      <RotateCcw className="h-4 w-4 text-primary" />
                    </button>
                  </form>
                ) : (
                  <form action={setBriefStatus.bind(null, brief.id, 'deleted')}>
                    <button type="submit" className="p-2 hover:bg-muted rounded-lg transition-colors" title="מחק">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
