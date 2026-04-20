import { createServiceClient } from '@/lib/supabase/server';
import { getActiveMkIds, getMkServer } from '@/lib/mk-server';
import { CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';
import { InviteCopyButton } from './InviteCopyButton';

export const dynamic = 'force-dynamic';

type Filter = 'all' | 'invited' | 'not-invited' | 'no-email';

interface Props {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function AdminMksPage({ searchParams }: Props) {
  const { filter = 'all', q = '' } = await searchParams;

  const supabase = createServiceClient();
  const ids = await getActiveMkIds();

  // Load all MKs and mk_users in parallel
  const [mksRaw, { data: mkUsers }] = await Promise.all([
    Promise.all(ids.map((id) => getMkServer(String(id)))),
    supabase.from('mk_users').select('mk_id, user_id, role'),
  ]);

  const mks = mksRaw.filter(Boolean) as NonNullable<Awaited<ReturnType<typeof getMkServer>>>[];
  const invitedIds = new Set((mkUsers ?? []).map((u) => u.mk_id));

  // Build enriched list
  let rows = mks.map((mk) => ({
    id: mk.id,
    name: mk.name,
    faction: mk.faction,
    email: mk.email ?? null,
    invited: invitedIds.has(mk.id),
  }));

  // Filter
  if (filter === 'invited') rows = rows.filter((r) => r.invited);
  if (filter === 'not-invited') rows = rows.filter((r) => !r.invited && !!r.email);
  if (filter === 'no-email') rows = rows.filter((r) => !r.email);

  // Search
  if (q) {
    const lq = q.toLowerCase();
    rows = rows.filter((r) => r.name.includes(lq) || r.faction.includes(lq));
  }

  const filters: { value: Filter; label: string }[] = [
    { value: 'all', label: `הכל (${mks.length})` },
    { value: 'invited', label: `הוזמנו (${mks.filter((m) => invitedIds.has(m.id)).length})` },
    { value: 'not-invited', label: `לא הוזמנו (${mks.filter((m) => !invitedIds.has(m.id) && m.email).length})` },
    { value: 'no-email', label: `ללא דוא"ל (${mks.filter((m) => !m.email).length})` },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">חברי כנסת</h1>

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1 bg-muted p-1 rounded-lg">
          {filters.map((f) => (
            <a
              key={f.value}
              href={`/admin/mks?filter=${f.value}&q=${q}`}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === f.value ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
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
            placeholder="חפש שם או סיעה..."
            className="w-full px-3 py-1.5 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input type="hidden" name="filter" value={filter} />
        </form>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-right px-4 py-3 font-medium">שם</th>
              <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">סיעה</th>
              <th className="text-right px-4 py-3 font-medium hidden md:table-cell">דוא"ל</th>
              <th className="text-right px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((mk) => (
              <tr key={mk.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{mk.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{mk.faction}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs" dir="ltr">
                  {mk.email ?? '—'}
                </td>
                <td className="px-4 py-3">
                  {mk.invited ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle className="h-3.5 w-3.5" /> הוזמן
                    </span>
                  ) : mk.email ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <XCircle className="h-3.5 w-3.5" /> לא הוזמן
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5" /> ללא דוא"ל
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {!mk.invited && mk.email && (
                    <InviteCopyButton mkId={mk.id} email={mk.email} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">לא נמצאו תוצאות</div>
        )}
      </div>
    </div>
  );
}
