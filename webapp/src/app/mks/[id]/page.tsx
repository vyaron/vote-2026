import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { MkProfileClient } from './MkProfileClient';
import type { MK } from '@/types';
import { generateMkMetadata, generateMkStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';

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

  return generateMkMetadata({
    id: mk.id,
    name: mk.name,
    faction: mk.faction,
    position: mk.position,
    bio: mk.bio,
  });
}

export default async function MkProfilePage({ params }: Props) {
  const { id } = await params;
  const mk = await getMk(id);

  if (!mk) {
    notFound();
  }

  // Generate structured data
  const personSchema = generateMkStructuredData({
    id: mk.id,
    name: mk.name,
    faction: mk.faction,
    position: mk.position,
    email: mk.email,
    dateOfBirth: mk.dateOfBirth,
    placeOfBirth: mk.placeOfBirth,
    images: mk.images,
  });

  const breadcrumbSchema = generateBreadcrumbStructuredData([
    { name: 'בית', url: SITE_URL },
    { name: 'חברי כנסת', url: `${SITE_URL}/mks` },
    { name: mk.name, url: `${SITE_URL}/mks/${mk.id}` },
  ]);

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <MkProfileClient mk={mk} />
    </>
  );
}
