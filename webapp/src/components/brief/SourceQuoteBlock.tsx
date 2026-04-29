import Link from 'next/link';
import { ExternalLink, Newspaper } from 'lucide-react';
import type { SourceMeta } from '@/lib/supabase/types';

interface Props {
  meta: SourceMeta;
}

export function SourceQuoteBlock({ meta }: Props) {
  const publishDate = new Date(meta.published_at).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Newspaper className="h-3.5 w-3.5 text-primary shrink-0" />
        <span className="font-semibold text-primary">{meta.name}</span>
        <span>·</span>
        <span>{publishDate}</span>
        <span className="mr-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
          מתוך חדשות
        </span>
      </div>

      <p className="text-sm font-semibold leading-snug">{meta.title}</p>

      {meta.excerpt && (
        <p className="text-sm text-muted-foreground border-r-2 border-primary/30 pr-3">{meta.excerpt}</p>
      )}

      <a
        href={meta.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <ExternalLink className="h-3 w-3" />
        למאמר המקורי
      </a>
    </div>
  );
}
