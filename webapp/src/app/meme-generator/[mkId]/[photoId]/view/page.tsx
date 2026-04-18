import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import type { MK } from '@/types';
import { MemeViewer } from './MemeViewer';

interface Props {
  params: Promise<{ mkId: string; photoId: string }>;
  searchParams: Promise<{ meme?: string }>;
}

async function getMk(mkId: number): Promise<MK | null> {
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'mks', `${mkId}.json`);
    return JSON.parse(await fs.readFile(p, 'utf-8'));
  } catch {
    return null;
  }
}

export default async function MemeViewPage({ params, searchParams }: Props) {
  const { mkId: mkIdStr, photoId: photoIdStr } = await params;
  const { meme } = await searchParams;

  const mkId = parseInt(mkIdStr, 10);
  const photoId = parseInt(photoIdStr, 10);

  if (isNaN(mkId) || isNaN(photoId)) notFound();

  const mk = await getMk(mkId);
  if (!mk) notFound();

  const photo = mk.photos.find(p => p.id === photoId);
  if (!photo) notFound();

  return (
    <MemeViewer
      mkId={mkId}
      mkName={mk.name}
      photoId={photoId}
      photoPath={`/data/${photo.localPath}`}
      encodedMeme={meme}
    />
  );
}
