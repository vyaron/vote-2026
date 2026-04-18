import type { MkPhoto } from '@/types';

export interface MemePhoto {
  mkId: number;
  mkName: string;
  photo: MkPhoto;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getShuffledPhotos(
  mks: Array<{ id: number; name: string; photos: MkPhoto[] }>
): MemePhoto[] {
  const mkGroups = shuffle(
    mks
      .map(mk => ({ mkId: mk.id, mkName: mk.name, photos: mk.photos }))
      .filter(g => g.photos.length > 0)
  );

  const maxLen = Math.max(...mkGroups.map(g => g.photos.length));
  const result: MemePhoto[] = [];

  for (let i = 0; i < maxLen; i++) {
    for (const group of mkGroups) {
      if (group.photos[i]) {
        result.push({ mkId: group.mkId, mkName: group.mkName, photo: group.photos[i] });
      }
    }
  }

  return result;
}
