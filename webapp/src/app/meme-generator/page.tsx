import { promises as fs } from 'fs';
import path from 'path';
import type { MK } from '@/types';
import { MkPhotoGrid } from './_components/MkPhotoGrid';
import type { MemePhoto } from './_lib/photos';

async function getAllMkPhotos(): Promise<MemePhoto[]> {
  const idsPath = path.join(process.cwd(), 'public', 'data', 'active-mk-ids.json');
  const ids: number[] = JSON.parse(await fs.readFile(idsPath, 'utf-8'));

  const mks: MK[] = (
    await Promise.all(
      ids.map(async id => {
        try {
          const p = path.join(process.cwd(), 'public', 'data', 'mks', `${id}.json`);
          return JSON.parse(await fs.readFile(p, 'utf-8')) as MK;
        } catch {
          return null;
        }
      })
    )
  ).filter((mk): mk is MK => mk !== null);

  // Return flat list grouped by MK — client will shuffle
  return mks.flatMap(mk =>
    mk.photos.map(photo => ({ mkId: mk.id, mkName: mk.name, photo }))
  );
}

export const metadata = { title: 'מחולל ממים | כנסת 2026' };

export default async function MemeGeneratorPage() {
  const photos = await getAllMkPhotos();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">מחולל ממים</h1>
        <p className="text-muted-foreground text-center mb-8">
          בחר תמונה, הוסף טקסט והורד את המם שלך
        </p>
        <MkPhotoGrid photos={photos} />
      </div>
    </div>
  );
}
