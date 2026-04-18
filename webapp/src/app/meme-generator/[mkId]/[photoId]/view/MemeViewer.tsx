'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Edit2, Share2, ArrowLeft } from 'lucide-react';
import { decodeMeme, defaultMeme } from '../../../_lib/encodeMeme';
import { drawMeme } from '../../../_lib/memeCanvas';

interface Props {
  mkId: number;
  mkName: string;
  photoId: number;
  photoPath: string;
  encodedMeme?: string;
}

export function MemeViewer({ mkId, mkName, photoId, photoPath, encodedMeme }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const state = encodedMeme
    ? (decodeMeme(encodedMeme) ?? defaultMeme(mkId, photoId))
    : defaultMeme(mkId, photoId);

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
      const ctx = canvas.getContext('2d')!;
      drawMeme(ctx, img, state.lines, -1, false);
    };
  }, [photoPath, state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/jpeg', 0.92);
    a.download = `meme-${mkName}.jpg`;
    a.click();
  };

  const handleEdit = () => {
    const params = encodedMeme ? `?meme=${encodedMeme}` : '';
    router.push(`/meme-generator/${mkId}/${photoId}${params}`);
  };

  const handleShareWhatsapp = () => {
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/meme-generator')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            גלריה
          </button>
          <h1 className="text-xl font-bold flex-1 text-center">{mkName}</h1>
        </div>

        {/* Canvas */}
        <div className="flex justify-center mb-6">
          <canvas ref={canvasRef} className="rounded-xl shadow-lg max-w-full" />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90"
            >
              <Download className="w-5 h-5" />
              הורד
            </button>
            <button
              onClick={handleEdit}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80"
            >
              <Edit2 className="w-5 h-5" />
              ערוך
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleShareWhatsapp}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white rounded-xl font-medium hover:opacity-90"
            >
              <Share2 className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={handleShareFacebook}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white rounded-xl font-medium hover:opacity-90"
            >
              <Share2 className="w-5 h-5" />
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
