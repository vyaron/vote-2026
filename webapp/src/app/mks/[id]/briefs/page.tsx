import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getMkServer } from '@/lib/mk-server';
import { getMkSlug } from '@/lib/slugs';
import { createClient } from '@/lib/supabase/server';
import { parseIdOrSlug } from '@/lib/slugs';
import { FileText, Calendar, Tag } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BriefsPage({ params }: Props) {
  const { id: idOrSlug } = await params;
  const mk = await getMkServer(idOrSlug);
  if (!mk) notFound();

  const supabase = await createClient();
  const { data: briefs } = await supabase
    .from('briefs')
    .select('id, title, subtitle, template, tags, publish_at, created_at, header_image')
    .eq('mk_id', mk.id)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('publish_at', { ascending: false });

  const basePath = `/mks/${getMkSlug(mk.id, mk.name)}`;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">מסרים</h2>
        <span className="text-sm text-muted-foreground">{briefs?.length ?? 0} מסרים</span>
      </div>

      {!briefs || briefs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-2xl">
          <FileText className="h-10 w-10 mx-auto mb-4 opacity-30" />
          <p>אין מסרים עדיין</p>
        </div>
      ) : (
        <div className="space-y-4">
          {briefs.map((brief) => {
            const date = brief.publish_at ?? brief.created_at;
            return (
              <Link
                key={brief.id}
                href={`${basePath}/briefs/${brief.id}`}
                className="block bg-card border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors group"
              >
                {brief.header_image && (
                  <div className="h-40 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={brief.header_image}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(date).toLocaleDateString('he-IL', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    <span>{brief.template === 'statement' ? 'הצהרה' : 'פוסט מדיה'}</span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug mb-1 group-hover:text-primary transition-colors">
                    {brief.title}
                  </h3>
                  {brief.subtitle && (
                    <p className="text-muted-foreground text-sm">{brief.subtitle}</p>
                  )}
                  {brief.tags && brief.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {brief.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
