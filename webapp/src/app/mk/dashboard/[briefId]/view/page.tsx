import { notFound, redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { getMkServer } from '@/lib/mk-server';
import { getMkPhotoPath } from '@/lib/data';
import { getMkSlug } from '@/lib/slugs';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { toEmbedUrl } from '@/lib/video';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Calendar, Tag, Eye } from 'lucide-react';
import type { Metadata } from 'next';
import { ShareActions } from './ShareActions';
import { SourceQuoteBlock } from '@/components/brief/SourceQuoteBlock';

interface Props {
  params: Promise<{ briefId: string }>;
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildBriefDescription(subtitle: string | null, body: string | null): string {
  if (subtitle?.trim()) return subtitle.trim();
  if (body?.trim()) return stripHtml(body).slice(0, 180);
  return 'מסר מעודכן מחבר הכנסת.';
}

function extractFirstParagraph(body: string | null): string {
  if (!body?.trim()) return '';

  const paragraphMatch = body.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  if (paragraphMatch?.[1]) {
    return stripHtml(paragraphMatch[1]).slice(0, 280);
  }

  return stripHtml(body).slice(0, 280);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { briefId } = await params;
  const service = createServiceClient();

  const { data: brief } = await service
    .from('briefs')
    .select('id, mk_id, title, subtitle, body, template, status, header_image')
    .eq('id', briefId)
    .neq('status', 'deleted')
    .single();

  if (!brief) {
    return {
      title: 'תצוגה מקדימה',
      robots: { index: false, follow: false },
    };
  }

  const mk = await getMkServer(String(brief.mk_id));
  const mkSlug = mk ? getMkSlug(mk.id, mk.name) : String(brief.mk_id);
  const publicPath = `/mks/${mkSlug}/briefs/${brief.id}`;
  const publicUrl = `${SITE_URL}${publicPath}`;
  const description = buildBriefDescription(brief.subtitle, brief.body);
  const imageUrl = brief.header_image ? brief.header_image : `${SITE_URL}${getMkPhotoPath(brief.mk_id)}`;

  return {
    title: `${brief.title} | ${SITE_NAME}`,
    description,
    alternates: {
      canonical: publicPath,
    },
    openGraph: {
      title: brief.title,
      description,
      url: publicUrl,
      siteName: SITE_NAME,
      locale: 'he_IL',
      type: 'article',
      images: [
        {
          url: imageUrl,
          alt: brief.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: brief.title,
      description,
      images: [imageUrl],
    },
    robots: brief.status === 'published' ? undefined : { index: false, follow: false },
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

export default async function BriefPreviewPage({ params }: Props) {
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
    .neq('status', 'deleted')
    .single();

  if (!brief) notFound();

  async function publishBrief() {
    'use server';
    const sb = await createClient();
    await sb.from('briefs').update({ status: 'published' }).eq('id', briefId);
    redirect(`/mk/dashboard/${briefId}/view`);
  }

  const [mk, { data: media }] = await Promise.all([
    getMkServer(String(brief.mk_id)),
    supabase.from('brief_media').select('*').eq('brief_id', briefId).order('sort_order'),
  ]);
  const publishDate = new Date(brief.publish_at ?? brief.created_at);
  const mkSlug = mk ? getMkSlug(mk.id, mk.name) : String(brief.mk_id);
  const publicBriefPath = `/mks/${mkSlug}/briefs/${brief.id}`;
  const publicBriefUrl = `${SITE_URL}${publicBriefPath}`;
  const shareQuote = extractFirstParagraph(brief.body) || brief.subtitle?.trim() || '';
  const shareParams = new URLSearchParams({ u: publicBriefUrl });
  if (shareQuote) shareParams.set('quote', shareQuote);
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?${shareParams.toString()}`;

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/mk/dashboard/${briefId}`} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowRight className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold flex-1">תצוגה מקדימה</h1>
        {brief.status === 'draft' && (
          <form action={publishBrief}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-green-500 bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors font-medium"
            >
              <Eye className="h-4 w-4" />
              פרסם עכשיו
            </button>
          </form>
        )}
        {brief.status === 'published' && (
          <ShareActions facebookShareUrl={facebookShareUrl} publicBriefUrl={publicBriefUrl} />
        )}
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          brief.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'
        }`}>
          {brief.status === 'published' ? 'פורסם' : 'טיוטה'}
        </span>
      </div>

      <article>
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

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {publishDate.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span>{brief.template === 'statement' ? 'הצהרה' : brief.template === 'news_brief' ? 'מסר מחדשות' : 'פוסט מדיה'}</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">{brief.title}</h2>
        {brief.subtitle && <p className="text-xl text-muted-foreground mb-6">{brief.subtitle}</p>}

        {mk && (
          <div className="flex items-center gap-3 py-4 border-y mb-6">
            <div className="h-10 w-10 rounded-full overflow-hidden relative shrink-0">
              <Image src={getMkPhotoPath(mk.id)} alt={mk.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold text-sm">{mk.name}</p>
              <p className="text-xs text-muted-foreground">{mk.faction}</p>
            </div>
          </div>
        )}

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

        {brief.tags && brief.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
            {brief.tags.map((tag: string) => (
              <span key={tag} className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-primary/10 text-primary rounded-full font-medium">
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
