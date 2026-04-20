'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RichTextEditor } from './RichTextEditor';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, X, Video } from 'lucide-react';
import type { BriefTemplate, Database } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';

type Brief = Database['public']['Tables']['briefs']['Row'];

const TAGS_SUGGESTIONS = [
  'כלכלה', 'ביטחון', 'חינוך', 'בריאות', 'דיור', 'חקיקה', 'חוץ', 'רווחה',
  'חברה', 'סביבה', 'תחבורה', 'טכנולוגיה', 'ספורט', 'תרבות', 'דת',
];

interface Props {
  mkId: number;
  userId: string;
  brief?: Brief;
}

export function BriefForm({ mkId, userId, brief }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<BriefTemplate>(brief?.template ?? 'statement');
  const [title, setTitle] = useState(brief?.title ?? '');
  const [subtitle, setSubtitle] = useState(brief?.subtitle ?? '');
  const [body, setBody] = useState(brief?.body ?? '');
  const [videoUrl, setVideoUrl] = useState(brief?.video_url ?? '');
  const [tags, setTags] = useState<string[]>(brief?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(brief?.header_image ?? null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [publishAt, setPublishAt] = useState(brief?.publish_at?.slice(0, 16) ?? '');
  const [error, setError] = useState('');

  const isEdit = !!brief;

  async function uploadHeaderImage(file: File) {
    setUploadingImage(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${mkId}/${brief?.id ?? 'new'}/${Date.now()}-header.${ext}`;
    const { error } = await supabase.storage.from('briefs').upload(path, file, { upsert: true });
    if (error) { setError('שגיאה בהעלאת תמונה'); setUploadingImage(false); return; }
    const { data } = supabase.storage.from('briefs').getPublicUrl(path);
    setHeaderImage(data.publicUrl);
    setUploadingImage(false);
  }

  function addTag(tag: string) {
    const t = tag.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('יש להזין כותרת'); return; }

    startTransition(async () => {
      const supabase = createClient();
      const updatableFields = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        body: body || null,
        header_image: headerImage,
        video_url: videoUrl.trim() || null,
        tags,
        publish_at: publishAt ? new Date(publishAt).toISOString() : null,
      };

      if (isEdit) {
        const { error } = await supabase.from('briefs').update(updatableFields).eq('id', brief.id);
        if (error) { console.error('briefs update error:', error); setError('שגיאה בשמירה'); return; }
      } else {
        const { error } = await supabase.from('briefs').insert({
          mk_id: mkId,
          author_id: userId,
          template,
          status: 'draft',
          ...updatableFields,
        });
        if (error) { console.error('briefs insert error:', error); setError('שגיאה ביצירת מסר'); return; }
      }

      router.push('/mk/dashboard');
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template picker — only on create */}
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium mb-2">סוג מסר</label>
          <div className="grid grid-cols-2 gap-3">
            {(['statement', 'media-rich'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTemplate(t)}
                className={cn(
                  'p-4 border rounded-xl text-right transition-colors',
                  template === t ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground',
                )}
              >
                <div className="font-semibold text-sm mb-1">
                  {t === 'statement' ? 'הצהרה' : 'פוסט מדיה'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t === 'statement'
                    ? 'טקסט ארוך, כותרת ותת-כותרת'
                    : 'גלריית תמונות עם טקסט קצר'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header image */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {template === 'media-rich' ? 'תמונת באנר' : 'תמונת כותרת'}
        </label>
        {headerImage ? (
          <div className="relative rounded-xl overflow-hidden aspect-[3/1]">
            <Image src={headerImage} alt="header" fill className="object-cover" />
            <button
              type="button"
              onClick={() => setHeaderImage(null)}
              className="absolute top-2 left-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            {uploadingImage ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
            <span className="text-sm">{uploadingImage ? 'מעלה...' : 'לחץ להעלאת תמונה'}</span>
            <span className="text-xs">JPEG, PNG, WebP, AVIF · עד 10MB</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && uploadHeaderImage(e.target.files[0])}
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="title">כותרת *</label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {/* Subtitle — statement only */}
      {template === 'statement' && (
        <div>
          <label className="block text-sm font-medium mb-2" htmlFor="subtitle">תת-כותרת</label>
          <input
            id="subtitle"
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      )}

      {/* Body */}
      <div>
        <label className="block text-sm font-medium mb-2">תוכן</label>
        <RichTextEditor value={body} onChange={setBody} />
      </div>

      {/* Video embed */}
      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Video className="h-4 w-4" />
          קישור וידאו (YouTube / Vimeo)
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          dir="ltr"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-2">תגיות</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="הוסף תגית ולחץ Enter..."
          className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {TAGS_SUGGESTIONS.filter((s) => !tags.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="text-xs px-2 py-1 bg-muted hover:bg-primary/10 rounded-full transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Scheduled publish */}
      <div>
        <label className="block text-sm font-medium mb-2" htmlFor="publishAt">
          פרסום מתוזמן (אופציונלי)
        </label>
        <input
          id="publishAt"
          type="datetime-local"
          value={publishAt}
          onChange={(e) => setPublishAt(e.target.value)}
          className="px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          dir="ltr"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'שמור שינויים' : 'שמור כטיוטה'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2.5 rounded-lg text-sm hover:bg-muted transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}
