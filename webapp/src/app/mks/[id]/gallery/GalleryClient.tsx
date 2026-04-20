'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { X } from 'lucide-react';
import type { MK } from '@/types';

interface Props {
  mk: Pick<MK, 'name' | 'photos'>;
}

export function GalleryClient({ mk }: Props) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  if (!mk.photos || mk.photos.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">אין תמונות בגלריה</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {mk.photos.map((photo, index) => (
          <motion.button
            key={photo.id || index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setSelectedPhoto(index)}
            className="aspect-square relative rounded-xl overflow-hidden group"
          >
            <Image
              src={`/data/${photo.localPath}`}
              alt={photo.title || mk.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </motion.button>
        ))}
      </div>

      {selectedPhoto !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full h-full">
            <Image
              src={`/data/${mk.photos![selectedPhoto].localPath}`}
              alt={mk.photos![selectedPhoto].title || mk.name}
              fill
              className="object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {mk.photos![selectedPhoto].title && (
            <div className="absolute bottom-4 left-4 right-4 text-center text-white text-sm">
              {mk.photos![selectedPhoto].title}
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
