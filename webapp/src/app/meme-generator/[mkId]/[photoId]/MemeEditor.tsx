'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Trash2, ChevronUp, ChevronDown,
  Download, Share2, ArrowLeft, Type, Film, Video, Loader2,
} from 'lucide-react';
import { useMemeState } from '../../_lib/useMemeState';
import { drawMeme, hitTestLines, hitTestRotationHandle } from '../../_lib/memeCanvas';
import { encodeMeme, decodeMeme, defaultMeme } from '../../_lib/encodeMeme';
import type { MemeLine } from '../../_lib/encodeMeme';
import { buildTimeline, getFrameState, FPS, OUTPUT_WIDTH } from '../../_lib/animationTimeline';
import { renderFrame } from '../../_lib/renderAnimationFrame';

const FONTS = ['Impact', 'Arial', 'David', 'Frank Ruhl Libre', 'Heebo'];

const STICKERS = [
  '😂', '😍', '🤣', '😭', '😎', '🔥', '💪', '👏',
  '🤦', '🙈', '💰', '🗳️', '🗣️', '✌️', '👆', '🤡',
  '😤', '🤬', '😴', '🥳', '💣', '🎯', '👑', '🐑',
];

interface Props {
  mkId: number;
  mkName: string;
  photoId: number;
  photoPath: string;
  initialMeme?: string;
}

export function MemeEditor({ mkId, mkName, photoId, photoPath, initialMeme }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ lineIdx: number; startX: number; startY: number } | null>(null);
  const rotateRef = useRef<{ lineIdx: number; startAngle: number; startRotation: number; cx: number; cy: number } | null>(null);

  const initial = initialMeme
    ? (decodeMeme(initialMeme) ?? defaultMeme(mkId, photoId))
    : defaultMeme(mkId, photoId);

  const [state, dispatch] = useMemeState(initial);
  const [exporting, setExporting] = useState<'gif' | 'mp4' | null>(null);

  const selectedLine: MemeLine | undefined = state.lines[state.selectedLineIdx];

  // Load image and set canvas size
  useEffect(() => {
    const img = new Image();
    img.src = photoPath;
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = canvas.parentElement?.clientWidth ?? 600;
      const scale = Math.min(1, maxW / img.naturalWidth);
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      redraw();
    };
  }, [photoPath]); // eslint-disable-line react-hooks/exhaustive-deps

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawMeme(ctx, img, state.lines, state.selectedLineIdx, true);
  }, [state]);

  useEffect(() => { redraw(); }, [redraw]);

  // Pointer events for drag & click-to-select
  const getCanvasPos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvasRef.current!.width / rect.width),
      y: (e.clientY - rect.top) * (canvasRef.current!.height / rect.height),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const { x, y } = getCanvasPos(e);

    // Check rotation handle of selected line first
    const sel = state.lines[state.selectedLineIdx];
    if (sel && hitTestRotationHandle(ctx, sel, x, y)) {
      const cx = sel.x * canvas.width;
      const cy = sel.y * canvas.height;
      rotateRef.current = {
        lineIdx: state.selectedLineIdx,
        startAngle: Math.atan2(y - cy, x - cx),
        startRotation: sel.rotation ?? 0,
        cx,
        cy,
      };
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    const hit = hitTestLines(ctx, state.lines, x, y);
    if (hit >= 0) {
      dispatch({ type: 'SELECT_LINE', idx: hit });
      dragRef.current = { lineIdx: hit, startX: x, startY: y };
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasPos(e);

    if (rotateRef.current) {
      const { lineIdx, startAngle, startRotation, cx, cy } = rotateRef.current;
      const angle = Math.atan2(y - cy, x - cx);
      const delta = (angle - startAngle) * (180 / Math.PI);
      dispatch({ type: 'SET_ROTATION', idx: lineIdx, rotation: startRotation + delta });
      return;
    }

    if (!dragRef.current) return;
    const { width, height } = canvas;
    dispatch({
      type: 'MOVE_LINE',
      idx: dragRef.current.lineIdx,
      x: Math.max(0, Math.min(1, x / width)),
      y: Math.max(0, Math.min(1, y / height)),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
    rotateRef.current = null;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Redraw without selection highlight for clean export
    const ctx = canvas.getContext('2d')!;
    drawMeme(ctx, imgRef.current!, state.lines, -1, false);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg', 0.92);
    a.download = `meme-${mkName}.jpg`;
    a.click();
    // Restore
    redraw();
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: 'gif' | 'mp4') => {
    const img = imgRef.current;
    if (!img || exporting) return;
    if (!state.lines.some(l => l.txt.trim())) return;

    setExporting(format);
    try {
      const w = OUTPUT_WIDTH;
      // H.264 requires even dimensions
      const h = Math.round((OUTPUT_WIDTH * img.naturalHeight / img.naturalWidth) / 2) * 2;

      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const ctx = offscreen.getContext('2d')!;

      const timeline = buildTimeline(state.lines);

      if (format === 'gif') {
        const { GIFEncoder, quantize, applyPalette } = await import('gifenc');
        const gif = GIFEncoder();
        const delay = Math.round(1000 / FPS);

        for (let f = 0; f < timeline.frameCount; f++) {
          const fs = getFrameState(timeline, f / FPS, state.lines);
          renderFrame(ctx, img, state.lines, fs);
          const { data } = ctx.getImageData(0, 0, w, h);
          const palette = quantize(data, 256);
          const index = applyPalette(data, palette);
          gif.writeFrame(index, w, h, { palette, delay, repeat: f === 0 ? 0 : undefined });
        }

        gif.finish();
        triggerDownload(new Blob([gif.bytes()], { type: 'image/gif' }), `meme-${mkName}.gif`);
      } else {
        if (typeof VideoEncoder === 'undefined') {
          alert('ייצוא MP4 דורש Chrome 94+ או Edge 94+');
          return;
        }

        const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
        const muxTarget = new ArrayBufferTarget();
        const muxer = new Muxer({
          target: muxTarget,
          video: { codec: 'avc', width: w, height: h, frameRate: FPS },
          fastStart: 'in-memory',
        });

        const encoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta ?? undefined),
          error: console.error,
        });
        encoder.configure({
          codec: 'avc1.42001f',
          width: w,
          height: h,
          bitrate: 1_500_000,
          framerate: FPS,
        });

        for (let f = 0; f < timeline.frameCount; f++) {
          const fs = getFrameState(timeline, f / FPS, state.lines);
          renderFrame(ctx, img, state.lines, fs);
          const frame = new VideoFrame(offscreen, {
            timestamp: Math.round(f * 1_000_000 / FPS),
            duration: Math.round(1_000_000 / FPS),
          });
          encoder.encode(frame, { keyFrame: f % 30 === 0 });
          frame.close();
        }

        await encoder.flush();
        muxer.finalize();
        triggerDownload(new Blob([muxTarget.buffer], { type: 'video/mp4' }), `meme-${mkName}.mp4`);
      }
    } finally {
      setExporting(null);
    }
  };

  const handleShare = () => {
    const encoded = encodeMeme(state);
    router.push(`/meme-generator/${mkId}/${photoId}/view?meme=${encoded}`);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/meme-generator')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            גלריה
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">{mkName}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Canvas */}
          <div className="flex-1 flex justify-center">
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-lg max-w-full cursor-move touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>

          {/* Controls */}
          <div className="lg:w-72 flex flex-col gap-4">
            {/* Line selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {state.lines.map((_, i) => (
                <button
                  key={i}
                  onClick={() => dispatch({ type: 'SELECT_LINE', idx: i })}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    state.selectedLineIdx === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  שורה {i + 1}
                </button>
              ))}
              <button
                onClick={() => dispatch({ type: 'ADD_LINE' })}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-muted hover:bg-muted/80"
              >
                <Plus className="w-3 h-3" />
                טקסט
              </button>
            </div>

            {/* Sticker picker */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">סטיקרים</label>
              <div className="grid grid-cols-8 gap-1">
                {STICKERS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => dispatch({
                      type: 'ADD_STICKER',
                      txt: emoji,
                    })}
                    className="text-xl hover:scale-125 transition-transform p-1 rounded"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {selectedLine && (
              <>
                {/* Text input */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">טקסט</label>
                  <input
                    value={selectedLine.txt}
                    onChange={e => dispatch({ type: 'SET_TEXT', idx: state.selectedLineIdx, txt: e.target.value })}
                    placeholder="הכנס טקסט..."
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Font family */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Type className="w-3 h-3" />
                    גופן
                  </label>
                  <select
                    value={selectedLine.fontFamily}
                    onChange={e => dispatch({ type: 'SET_FONT', idx: state.selectedLineIdx, fontFamily: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                  >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                {/* Font size */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">גודל ({selectedLine.size}px)</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dispatch({ type: 'SET_SIZE', idx: state.selectedLineIdx, delta: -4 })}
                      className="flex-1 flex items-center justify-center gap-1 py-2 border rounded-lg text-sm hover:bg-muted"
                    >
                      <ChevronDown className="w-4 h-4" /> קטן
                    </button>
                    <button
                      onClick={() => dispatch({ type: 'SET_SIZE', idx: state.selectedLineIdx, delta: 4 })}
                      className="flex-1 flex items-center justify-center gap-1 py-2 border rounded-lg text-sm hover:bg-muted"
                    >
                      <ChevronUp className="w-4 h-4" /> גדול
                    </button>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">צבע</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={selectedLine.color}
                      onChange={e => dispatch({ type: 'SET_COLOR', idx: state.selectedLineIdx, color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    {['#ffffff', '#000000', '#ffff00', '#ff0000', '#00bfff'].map(c => (
                      <button
                        key={c}
                        onClick={() => dispatch({ type: 'SET_COLOR', idx: state.selectedLineIdx, color: c })}
                        className="w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform"
                        style={{ background: c, borderColor: selectedLine.color === c ? '#6366f1' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>

                {/* Delete line */}
                {state.lines.length > 1 && (
                  <button
                    onClick={() => dispatch({ type: 'DELETE_LINE', idx: state.selectedLineIdx })}
                    className="flex items-center justify-center gap-2 py-2 border border-destructive text-destructive rounded-lg text-sm hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                    מחק שורה
                  </button>
                )}
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-auto pt-4 border-t">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90"
              >
                <Download className="w-4 h-4" />
                הורד
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80"
              >
                <Share2 className="w-4 h-4" />
                שתף
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('gif')}
                disabled={!!exporting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting === 'gif'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Film className="w-4 h-4" />}
                GIF
              </button>
              <button
                onClick={() => handleExport('mp4')}
                disabled={!!exporting}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting === 'mp4'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Video className="w-4 h-4" />}
                MP4
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
