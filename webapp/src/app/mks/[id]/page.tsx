import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MkProfileClient } from './MkProfileClient';
import type { MK } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
}

async function getMk(id: string): Promise<MK | null> {
  try {
    // In production, this would be a proper API call
    // For now, we'll load from the public data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/data/mks/${id}.json`, { 
      cache: 'force-cache' 
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const mk = await getMk(id);
  
  if (!mk) {
    return { title: 'חבר כנסת לא נמצא' };
  }

  return {
    title: mk.name,
    description: `פרופיל של ${mk.fullTitle} - ${mk.faction}`,
    openGraph: {
      title: mk.name,
      description: `פרופיל של ${mk.fullTitle}`,
      images: [mk.images.profile],
    },
  };
}

export default async function MkProfilePage({ params }: Props) {
  const { id } = await params;
  const mk = await getMk(id);

  if (!mk) {
    notFound();
  }

  return <MkProfileClient mk={mk} />;
}
