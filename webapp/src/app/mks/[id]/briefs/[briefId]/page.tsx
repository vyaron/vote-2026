import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getMkServer } from '@/lib/mk-server';
import { getMkSlug } from '@/lib/slugs';
import { createClient } from '@/lib/supabase/server';
import { toEmbedUrl } from '@/lib/video';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { Calendar, Tag, ArrowRight, Share2 } from 'lucide-react';
import { getMkPhotoPath } from '@/lib/data';
import type { Metadata } from 'next';
import { SourceQuoteBlock } from '@/components/brief/SourceQuoteBlock';

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string; briefId: string }>;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getSourceMetaText(sourceMeta: unknown): string {
  if (!sourceMeta || typeof sourceMeta !== 'object') return '';
  const meta = sourceMeta as Record<string, unknown>;
  const excerpt = typeof meta.excerpt === 'string' ? meta.excerpt.trim() : '';
  if (excerpt) return excerpt;
  const title = typeof meta.title === 'string' ? meta.title.trim() : '';
  return title;
}

function buildBriefDescription(
  subtitle: string | null,
  body: string | null,
  sourceMeta: unknown,
): string {
  const bodyText = body ? stripHtml(body) : '';
  const sourceMetaText = getSourceMetaText(sourceMeta);
  const fallback = 'מסר מעודכן מחבר הכנסת.';
  return [subtitle?.trim(), bodyText, sourceMetaText, fallback].find(Boolean)!.slice(0, 180);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: idOrSlug, briefId } = await params;
  const supabase = await createClient();
  const { data: brief } = await supabase
    .from('briefs')
    .select('id, mk_id, title, subtitle, body, header_image, header_image_fit, header_image_position_x, header_image_position_y, header_image_scale, status, publish_at, created_at, source_meta')
    .eq('id', briefId)
    .eq('status', 'published')
    .is('deleted_at', null)
    .single();
  if (!brief) return {};

  const mk = await getMkServer(String(brief.mk_id));
  const mkSlug = mk ? getMkSlug(mk.id, mk.name) : idOrSlug;
  const briefPath = `/mks/${mkSlug}/briefs/${brief.id}`;
  const briefUrl = `${SITE_URL}${briefPath}`;
  const description = buildBriefDescription(brief.subtitle, brief.body, brief.source_meta);
  const fallbackOgImage = `${SITE_URL}/knesset1.png`;
  const ogImages = brief.header_image
    ? [
        { url: brief.header_image, alt: brief.title },
        { url: fallbackOgImage, alt: brief.title },
      ]
    : [{ url: fallbackOgImage, alt: brief.title }];

  return {
    title: `${brief.title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: briefPath,
    },
    openGraph: {
      title: brief.title,
      description,
      url: briefUrl,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'he_IL',
      publishedTime: brief.publish_at ?? brief.created_at,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: brief.title,
      description,
      images: [brief.header_image || fallbackOgImage],
    },
  };
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
        <div
          className={`relative rounded-2xl overflow-hidden mb-6 ${brief.template === 'media-rich' ? 'aspect-2/1' : ''}`}
          style={(brief.template === 'statement' || brief.template === 'news_brief') ? { paddingBottom: `${brief.header_image_scale ?? 33}%` } : undefined}
        >
          <Image
            src={brief.header_image}
            alt=""
            fill
            priority
            className={brief.header_image_fit === 'contain' ? 'bg-muted' : undefined}
            style={{
              objectFit: brief.header_image_fit ?? 'cover',
              objectPosition: `${brief.header_image_position_x ?? 50}% ${brief.header_image_position_y ?? 50}%`,
            }}
          />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {publishDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <span>{brief.template === 'statement' ? 'הצהרה' : brief.template === 'news_brief' ? 'מסר מחדשות' : 'פוסט מדיה'}</span>
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
          {brief.source_meta && <SourceQuoteBlock meta={brief.source_meta} />}
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

      {brief.template === 'news_brief' && (
        <>
          {brief.source_meta && <SourceQuoteBlock meta={brief.source_meta} />}
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
