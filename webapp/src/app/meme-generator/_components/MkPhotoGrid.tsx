'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChevronDown, X, Shuffle } from 'lucide-react';
import type { MemePhoto } from '../_lib/photos';
import { getShuffledPhotos } from '../_lib/photos';
import { randomLine } from '../_lib/randomLines';
import { encodeMeme, defaultMeme } from '../_lib/encodeMeme';

const BATCH_SIZE = 40;

interface Props {
  photos: MemePhoto[];
}

export function MkPhotoGrid({ photos }: Props) {
  const router = useRouter();
  const [selectedMkId, setSelectedMkId] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Shuffle once on mount
  const shuffled = useMemo(() => getShuffledPhotos(
    Object.values(
      photos.reduce<Record<number, { id: number; name: string; photos: MemePhoto['photo'][] }>>(
        (acc, p) => {
          if (!acc[p.mkId]) acc[p.mkId] = { id: p.mkId, name: p.mkName, photos: [] };
          acc[p.mkId].photos.push(p.photo);
          return acc;
        },
        {}
      )
    )
  ), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered list (when an MK is selected, show their photos in order)
  const displayed = useMemo(() => {
    if (selectedMkId === null) return shuffled;
    return photos.filter(p => p.mkId === selectedMkId);
  }, [shuffled, photos, selectedMkId]);

  // Reset visible count when filter changes
  useEffect(() => { setVisibleCount(BATCH_SIZE); }, [selectedMkId]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(c => Math.min(c + BATCH_SIZE, displayed.length));
        }
      },
      { rootMargin: '300px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [displayed.length]);

  // MK options for dropdown
  const mkOptions = useMemo(() => {
    const seen = new Map<number, string>();
    for (const p of photos) {
      if (!seen.has(p.mkId)) seen.set(p.mkId, p.mkName);
    }
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }, [photos]);

  const filteredOptions = useMemo(
    () => mkOptions.filter(mk => mk.name.includes(search)),
    [mkOptions, search]
  );

  const selectedMkName = selectedMkId ? mkOptions.find(m => m.id === selectedMkId)?.name : null;

  const handlePhotoClick = useCallback((p: MemePhoto) => {
    router.push(`/meme-generator/${p.mkId}/${p.photo.id}`);
  }, [router]);

  const handleRandom = useCallback(() => {
    const pool = selectedMkId ? photos.filter(p => p.mkId === selectedMkId) : photos;
    if (pool.length === 0) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const state = defaultMeme(pick.mkId, pick.photo.id);
    state.lines[0].txt = randomLine();
    router.push(`/meme-generator/${pick.mkId}/${pick.photo.id}?meme=${encodeMeme(state)}`);
  }, [photos, selectedMkId, router]);

  return (
    <div dir="rtl">
      {/* Toolbar */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        {/* MK dropdown */}
        <div className="relative flex-1 min-w-[200px]">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="w-full flex items-center justify-between gap-2 border rounded-lg px-3 py-2 bg-background hover:bg-muted transition-colors text-sm"
          >
            <span className={selectedMkName ? '' : 'text-muted-foreground'}>
              {selectedMkName ?? 'סנן לפי ח״כ'}
            </span>
            <ChevronDown className="w-4 h-4 shrink-0" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg max-h-72 flex flex-col">
              <div className="p-2 border-b">
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="חפש ח״כ..."
                  className="w-full px-2 py-1 text-sm bg-background border rounded outline-none"
                />
              </div>
              <div className="overflow-y-auto flex-1">
                <button
                  onClick={() => { setSelectedMkId(null); setDropdownOpen(false); setSearch(''); }}
                  className="w-full text-right px-3 py-2 text-sm hover:bg-muted transition-colors text-muted-foreground"
                >
                  הצג הכל
                </button>
                {filteredOptions.map(mk => (
                  <button
                    key={mk.id}
                    onClick={() => { setSelectedMkId(mk.id); setDropdownOpen(false); setSearch(''); }}
                    className={`w-full text-right px-3 py-2 text-sm hover:bg-muted transition-colors ${selectedMkId === mk.id ? 'bg-muted font-medium' : ''}`}
                  >
                    {mk.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedMkId && (
          <button
            onClick={() => setSelectedMkId(null)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
            נקה
          </button>
        )}

        <button
          onClick={handleRandom}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          צור רנדומלי
        </button>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {displayed.slice(0, visibleCount).map((p, idx) => (
          <button
            key={`${p.mkId}-${p.photo.id}-${idx}`}
            onClick={() => handlePhotoClick(p)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted hover:ring-2 hover:ring-primary transition-all"
            title={p.mkName}
          >
            <Image
              src={`/data/${p.photo.localPath}`}
              alt={p.mkName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
              <p className="text-white text-xs font-medium truncate">{p.mkName}</p>
            </div>
          </button>
        ))}
      </div>

      {visibleCount < displayed.length && (
        <div ref={sentinelRef} className="h-8 mt-4" aria-hidden />
      )}
    </div>
  );
}
