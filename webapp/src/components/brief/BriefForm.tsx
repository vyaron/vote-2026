'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { RichTextEditor } from './RichTextEditor';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Upload, X, Video, Images, Sparkles, ExternalLink } from 'lucide-react';
import type { BriefTemplate, Database } from '@/lib/supabase/types';
import type { PhotoSuggestion } from '@/app/api/photo-suggest/route';
import { cn } from '@/lib/utils';

type Brief = Database['public']['Tables']['briefs']['Row'];
type BriefMediaRow = Database['public']['Tables']['brief_media']['Row'];

type GalleryItem = { tempId: string; url: string; alt: string };

const TAGS_SUGGESTIONS = [
  'כלכלה', 'ביטחון', 'חינוך', 'בריאות', 'דיור', 'חקיקה', 'חוץ', 'רווחה',
  'חברה', 'סביבה', 'תחבורה', 'טכנולוגיה', 'ספורט', 'תרבות', 'דת',
];

interface Props {
  mkId: number;
  userId: string;
  brief?: Brief;
  initialMedia?: BriefMediaRow[];
}

export function BriefForm({ mkId, userId, brief, initialMedia }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [template, setTemplate] = useState<BriefTemplate>(brief?.template ?? 'statement');
  const [title, setTitle] = useState(brief?.title ?? '');
  const [subtitle, setSubtitle] = useState(brief?.subtitle ?? '');
  const [body, setBody] = useState(brief?.body ?? '');
  const [videoUrl, setVideoUrl] = useState(brief?.video_url ?? '');
  const [tags, setTags] = useState<string[]>(brief?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [headerImage, setHeaderImage] = useState<string | null>(brief?.header_image ?? null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
    (initialMedia ?? []).map((m) => ({ tempId: m.id, url: m.url, alt: m.alt ?? '' })),
  );
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [publishAt, setPublishAt] = useState(brief?.publish_at?.slice(0, 16) ?? '');
  const [error, setError] = useState('');

  // Photo suggestion state
  const [suggestPhotos, setSuggestPhotos] = useState<PhotoSuggestion[]>([]);
  const [fetchingPhotos, setFetchingPhotos] = useState(false);
  const [showPhotoPanel, setShowPhotoPanel] = useState(false);

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

  async function uploadGalleryImage(file: File) {
    setUploadingGallery(true);
    const supabase = createClient();
    const ext = file.name.split('.').pop();
    const path = `${mkId}/gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('briefs').upload(path, file, { upsert: true });
    if (error) { setError('שגיאה בהעלאת תמונה'); setUploadingGallery(false); return; }
    const { data } = supabase.storage.from('briefs').getPublicUrl(path);
    setGalleryItems((prev) => [...prev, { tempId: crypto.randomUUID(), url: data.publicUrl, alt: '' }]);
    setUploadingGallery(false);
  }

  function removeGalleryItem(tempId: string) {
    setGalleryItems((prev) => prev.filter((item) => item.tempId !== tempId));
  }

  async function handleSuggestPhotos() {
    setShowPhotoPanel(true);
    if (suggestPhotos.length > 0) return; // already loaded
    setFetchingPhotos(true);
    const q = [...tags, title].filter(Boolean).join(' ');
    try {
      const res = await fetch(`/api/photo-suggest?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestPhotos(data.photos ?? []);
    } catch {
      setError('שגיאה בטעינת הצעות תמונה');
    } finally {
      setFetchingPhotos(false);
    }
  }

  function selectSuggestedPhoto(photo: PhotoSuggestion) {
    if (template === 'media-rich') {
      setGalleryItems((prev) => [...prev, { tempId: crypto.randomUUID(), url: photo.fullUrl, alt: photo.alt }]);
    } else {
      setHeaderImage(photo.fullUrl);
    }
    setShowPhotoPanel(false);
    setSuggestPhotos([]);
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
        subtitle: template === 'statement' ? (subtitle.trim() || null) : null,
        body: body || null,
        header_image: template === 'statement' ? headerImage : null,
        video_url: videoUrl.trim() || null,
        tags,
        publish_at: publishAt ? new Date(publishAt).toISOString() : null,
      };

      let briefId = brief?.id;

      if (isEdit) {
        const { error } = await supabase.from('briefs').update(updatableFields).eq('id', brief.id);
        if (error) { console.error('briefs update error:', error); setError('שגיאה בשמירה'); return; }
      } else {
        const { data: newBrief, error } = await supabase.from('briefs').insert({
          mk_id: mkId,
          author_id: userId,
          template,
          status: 'draft',
          ...updatableFields,
        }).select('id').single();
        if (error || !newBrief) { console.error('briefs insert error:', error); setError('שגיאה ביצירת מסר'); return; }
        briefId = newBrief.id;
      }

      // Sync brief_media for media-rich
      if (template === 'media-rich' && briefId) {
        await supabase.from('brief_media').delete().eq('brief_id', briefId);
        if (galleryItems.length > 0) {
          const { error: mediaError } = await supabase.from('brief_media').insert(
            galleryItems.map((item, idx) => ({
              brief_id: briefId!,
              url: item.url,
              alt: item.alt || null,
              sort_order: idx,
            })),
          );
          if (mediaError) { console.error('brief_media insert error:', mediaError); setError('שגיאה בשמירת גלריה'); return; }
        }
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
                    : 'גלריית תמונות עם כיתוב קצר'}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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

      {/* Header image — statement only */}
      {template === 'statement' && (
        <div>
          <label className="block text-sm font-medium mb-2">תמונת כותרת</label>
          {headerImage ? (
            <div className="relative rounded-xl overflow-hidden aspect-3/1">
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {uploadingImage ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6" />}
                <span className="text-sm">{uploadingImage ? 'מעלה...' : 'העלאת תמונה'}</span>
                <span className="text-xs">JPEG, PNG, WebP, AVIF</span>
              </button>
              <button
                type="button"
                onClick={handleSuggestPhotos}
                disabled={!title && tags.length === 0}
                className="flex-1 border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
              >
                <Sparkles className="h-6 w-6" />
                <span className="text-sm">הצע תמונה</span>
                <span className="text-xs">מבוסס כותרת / תגיות</span>
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadHeaderImage(e.target.files[0])}
          />
          {/* Photo suggestion panel */}
          {showPhotoPanel && !headerImage && (
            <PhotoPickerPanel
              photos={suggestPhotos}
              loading={fetchingPhotos}
              onSelect={selectSuggestedPhoto}
              onClose={() => setShowPhotoPanel(false)}
              onRefresh={() => { setSuggestPhotos([]); handleSuggestPhotos(); }}
            />
          )}
        </div>
      )}

      {/* Gallery — media-rich only */}
      {template === 'media-rich' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Images className="h-4 w-4" />
            גלריית תמונות
          </label>
          {galleryItems.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {galleryItems.map((item) => (
                <div key={item.tempId} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image src={item.url} alt={item.alt} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(item.tempId)}
                    className="absolute top-1 left-1 p-1 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={uploadingGallery}
              className="flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {uploadingGallery ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              <span className="text-sm">{uploadingGallery ? 'מעלה...' : 'העלאת תמונה'}</span>
            </button>
            <button
              type="button"
              onClick={handleSuggestPhotos}
              disabled={!title && tags.length === 0}
              className="flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm">הצע תמונה</span>
            </button>
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadGalleryImage(e.target.files[0])}
          />
          {/* Photo suggestion panel */}
          {showPhotoPanel && (
            <PhotoPickerPanel
              photos={suggestPhotos}
              loading={fetchingPhotos}
              onSelect={selectSuggestedPhoto}
              onClose={() => setShowPhotoPanel(false)}
              onRefresh={() => { setSuggestPhotos([]); handleSuggestPhotos(); }}
            />
          )}
        </div>
      )}

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
        <label className="block text-sm font-medium mb-2">
          {template === 'media-rich' ? 'כיתוב קצר' : 'תוכן'}
        </label>
        {template === 'statement' ? (
          <RichTextEditor value={body} onChange={setBody} />
        ) : (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="תיאור קצר של הפוסט (עד 500 תווים)..."
            className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
          />
        )}
      </div>

      {/* Video embed */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
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

// ---------------------------------------------------------------------------
// Photo picker panel
// ---------------------------------------------------------------------------

interface PhotoPickerPanelProps {
  photos: PhotoSuggestion[];
  loading: boolean;
  onSelect: (photo: PhotoSuggestion) => void;
  onClose: () => void;
  onRefresh: () => void;
}

function PhotoPickerPanel({ photos, loading, onSelect, onClose, onRefresh }: PhotoPickerPanelProps) {
  return (
    <div className="mt-3 border rounded-xl p-4 bg-muted/30">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">הצעות תמונה מ-Unsplash</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="text-xs px-2 py-1 rounded-lg border hover:bg-muted transition-colors disabled:opacity-50"
          >
            רענן
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && photos.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">לא נמצאו תמונות. נסה להוסיף תגיות.</p>
      )}

      {!loading && photos.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onSelect(photo)}
                className="relative aspect-3/2 rounded-lg overflow-hidden group focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Image
                  src={photo.thumbUrl}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    בחר
                  </span>
                </div>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            תמונות מאת{' '}
            <a
              href="https://unsplash.com?utm_source=vote2026&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground inline-flex items-center gap-0.5"
            >
              Unsplash <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </>
      )}
    </div>
  );
}
