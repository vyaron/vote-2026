import { createServiceClient } from '@/lib/supabase/server';
import { getMkServer } from '@/lib/mk-server';
import { redirect } from 'next/navigation';
import { Eye, EyeOff, Trash2, RotateCcw } from 'lucide-react';
import type { BriefStatus, Database } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type BriefUpdate = Database['public']['Tables']['briefs']['Update'];

const STATUS_LABEL: Record<string, string> = { draft: 'טיוטה', published: 'פורסם', deleted: 'נמחק' };
const STATUS_CLASS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  published: 'bg-green-500/10 text-green-600',
  deleted: 'bg-destructive/10 text-destructive',
};

async function setStatus(briefId: string, status: BriefStatus) {
  'use server';
  const supabase = createServiceClient();
  const update: BriefUpdate =
    status === 'deleted'
      ? { status, deleted_at: new Date().toISOString() }
      : { status, deleted_at: null };
  await supabase.from('briefs').update(update).eq('id', briefId);
  redirect('/admin/briefs');
}

interface Props {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminBriefsPage({ searchParams }: Props) {
  const { status = 'all', q = '' } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from('briefs')
    .select('id, mk_id, title, template, status, created_at, publish_at, deleted_at')
    .order('created_at', { ascending: false });

  if (status !== 'all') query = query.eq('status', status as BriefStatus);

  const { data: briefs } = await query;

  // Enrich with MK names (fetch unique mk_ids only)
  const uniqueMkIds = [...new Set((briefs ?? []).map((b) => b.mk_id))];
  const mkNames = new Map<number, string>();
  await Promise.all(
    uniqueMkIds.map(async (id) => {
      const mk = await getMkServer(String(id));
      if (mk) mkNames.set(id, mk.name);
    }),
  );

  let rows = (briefs ?? []).map((b) => ({ ...b, mkName: mkNames.get(b.mk_id) ?? String(b.mk_id) }));

  if (q) {
    const lq = q.toLowerCase();
    rows = rows.filter((r) => r.title.toLowerCase().includes(lq) || r.mkName.toLowerCase().includes(lq));
  }

  const statusFilters = [
    { value: 'all', label: 'הכל' },
    { value: 'published', label: 'פורסם' },
    { value: 'draft', label: 'טיוטה' },
    { value: 'deleted', label: 'נמחק' },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">מסרים</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {statusFilters.map((f) => (
            <a
              key={f.value}
              href={`/admin/briefs?status=${f.value}&q=${q}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                status === f.value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </a>
          ))}
        </div>
        <form className="flex-1 min-w-48">
          <input
            name="q"
            defaultValue={q}
            placeholder={'חפש כותרת או שם ח"כ...'}
            className="w-full px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input type="hidden" name="status" value={status} />
        </form>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-right px-4 py-3 font-medium">כותרת</th>
              <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">ח"כ</th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">תאריך</th>
              <th className="text-right px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((brief) => (
              <tr key={brief.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{brief.title}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{brief.mkName}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                  {new Date(brief.publish_at ?? brief.created_at).toLocaleDateString('he-IL')}
                </td>
                <td className="px-4 py-3">
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', STATUS_CLASS[brief.status])}>
                    {STATUS_LABEL[brief.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {brief.status === 'draft' && (
                      <form action={setStatus.bind(null, brief.id, 'published')}>
                        <button type="submit" className="p-1.5 hover:bg-muted rounded-lg" title="פרסם">
                          <Eye className="h-3.5 w-3.5 text-green-600" />
                        </button>
                      </form>
                    )}
                    {brief.status === 'published' && (
                      <form action={setStatus.bind(null, brief.id, 'draft')}>
                        <button type="submit" className="p-1.5 hover:bg-muted rounded-lg" title="הסר מפרסום">
                          <EyeOff className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    )}
                    {brief.status === 'deleted' ? (
                      <form action={setStatus.bind(null, brief.id, 'draft')}>
                        <button type="submit" className="p-1.5 hover:bg-muted rounded-lg" title="שחזר">
                          <RotateCcw className="h-3.5 w-3.5 text-primary" />
                        </button>
                      </form>
                    ) : (
                      <form action={setStatus.bind(null, brief.id, 'deleted')}>
                        <button type="submit" className="p-1.5 hover:bg-muted rounded-lg" title="מחק">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">לא נמצאו מסרים</div>
        )}
      </div>
    </div>
  );
}
