import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Newspaper } from 'lucide-react';
import type { FeedItem } from '@/lib/feed/maariv';

interface Props {
  item: FeedItem;
  isMk: boolean;
}

export function FeedCard({ item, isMk }: Props) {
  const publishDate = new Date(item.publishedAt).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const briefParams = new URLSearchParams({
    source: 'feed',
    sourceId: item.id,
    sourceTitle: item.title,
    sourceUrl: item.link,
    sourceName: item.sourceName,
    sourcePublishedAt: item.publishedAt,
    sourceSummary: item.summary,
    ...(item.imageUrl ? { sourceImageUrl: item.imageUrl } : {}),
  });

  return (
    <div className="bg-card border rounded-2xl overflow-hidden flex flex-col sm:flex-row gap-0 hover:shadow-md transition-shadow">
      {item.imageUrl ? (
        <div className="relative w-full sm:w-40 shrink-0 aspect-video sm:aspect-auto min-h-28">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 160px"
          />
        </div>
      ) : (
        <div className="hidden sm:flex w-40 shrink-0 items-center justify-center bg-muted text-muted-foreground">
          <Newspaper className="h-8 w-8 opacity-30" />
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <span className="font-semibold text-primary">{item.sourceName}</span>
          {item.author && <span>{item.author}</span>}
          <span>{publishDate}</span>
        </div>

        <h2 className="font-bold text-sm sm:text-base leading-snug line-clamp-2">{item.title}</h2>

        {item.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
        )}

        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2">
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            קרא עוד
          </a>

          {isMk && (
            <Link
              href={`/mk/dashboard/new?${briefParams.toString()}`}
              className="mr-auto inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              + צור בריף
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
