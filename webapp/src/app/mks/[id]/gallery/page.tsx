import { notFound } from 'next/navigation';
import { getMkServer } from '@/lib/mk-server';
import { GalleryClient } from './GalleryClient';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GalleryPage({ params }: Props) {
  const { id: idOrSlug } = await params;
  const mk = await getMkServer(idOrSlug);
  if (!mk) notFound();

  return <GalleryClient mk={{ name: mk.name, photos: mk.photos }} />;
}
