import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMkServer } from '@/lib/mk-server';
import { getMkSlug } from '@/lib/slugs';
import { createClient } from '@/lib/supabase/server';
import { toEmbedUrl } from '@/lib/video';
import { Calendar, Tag, ArrowRight, Share2 } from 'lucide-react';
import { getMkPhotoPath } from '@/lib/data';
import type { Metadata } from 'next';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string; briefId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { briefId } = await params;
  const supabase = await createClient();
  const { data: brief } = await supabase
    .from('briefs')
    .select('title, subtitle')
    .eq('id', briefId)
    .single();
  if (!brief) return {};
  return { title: brief.title, description: brief.subtitle ?? undefined };
}

function VideoEmbed({ url }: { url: string }) {
  const embedUrl = toEmbedUrl(url);
  if (!embedUrl) return null;
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden my-6">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export default async function BriefPage({ params }: Props) {
  const { id: idOrSlug, briefId } = await params;

  const supabase = await createClient();

  const { data: brief } = await supabase
    .from('briefs')
    .select('*')
    .eq('id', briefId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();

  if (!brief) notFound();

  const mk = await getMkServer(String(brief.mk_id));

  const { data: media } = await supabase
    .from('brief_media')
    .select('*')
    .eq('brief_id', briefId)
    .order('sort_order');

  const basePath = mk ? `/mks/${getMkSlug(mk.id, mk.name)}` : `/mks/${idOrSlug}`;
  const publishDate = new Date(brief.publish_at ?? brief.created_at);

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href={`${basePath}/briefs`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowRight className="h-4 w-4" />
        כל המסרים
      </Link>

      {/* Header image */}
      {brief.header_image && (
        <div className={`relative rounded-2xl overflow-hidden mb-6 ${brief.template === 'media-rich' ? 'aspect-[2/1]' : 'aspect-[3/1]'}`}>
          <Image src={brief.header_image} alt="" fill className="object-cover" priority />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {publishDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <span>{brief.template === 'statement' ? 'הצהרה' : 'פוסט מדיה'}</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">{brief.title}</h1>
      {brief.subtitle && (
        <p className="text-xl text-muted-foreground mb-6">{brief.subtitle}</p>
      )}

      {/* Author */}
      {mk && (
        <div className="flex items-center gap-3 py-4 border-y mb-6">
          <div className="h-10 w-10 rounded-full overflow-hidden relative shrink-0">
            <Image src={getMkPhotoPath(mk.id)} alt={mk.name} fill className="object-cover" />
          </div>
          <div>
            <Link href={basePath} className="font-semibold text-sm hover:underline">{mk.name}</Link>
            <p className="text-xs text-muted-foreground">{mk.faction}</p>
          </div>
        </div>
      )}

      {/* Template A: statement — body first, video after */}
      {brief.template === 'statement' && (
        <>
          {brief.body && (
            <div
              className="prose prose-lg max-w-none mb-6 [&_p]:text-muted-foreground [&_p]:leading-relaxed"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: brief.body }}
            />
          )}
          {brief.video_url && <VideoEmbed url={brief.video_url} />}
        </>
      )}

      {/* Template B: media-rich — gallery then body then video */}
      {brief.template === 'media-rich' && (
        <>
          {media && media.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {media.map((item) => (
                <div key={item.id} className="aspect-square relative rounded-xl overflow-hidden">
                  <Image src={item.url} alt={item.alt ?? ''} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
          {brief.body && (
            <div
              className="prose prose-lg max-w-none mb-6 [&_p]:text-muted-foreground [&_p]:leading-relaxed"
              dir="rtl"
              dangerouslySetInnerHTML={{ __html: brief.body }}
            />
          )}
          {brief.video_url && <VideoEmbed url={brief.video_url} />}
        </>
      )}

      {/* Tags */}
      {brief.tags && brief.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
          {brief.tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
