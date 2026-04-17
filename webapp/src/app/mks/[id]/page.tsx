import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { MkProfileClient } from './MkProfileClient';
import type { MK } from '@/types';
import { generateMkMetadata, generateMkStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { parseIdOrSlug, getMkSlug, isNumericId, generateUniqueSlug } from '@/lib/slugs';

// Force static generation for all paths
export const dynamic = 'force-static';
export const dynamicParams = true;

interface Props {
  params: Promise<{ id: string }>;
}

async function getMk(idOrSlug: string): Promise<MK | null> {
  // Parse the slug to extract the numeric ID
  const id = parseIdOrSlug(idOrSlug);
  console.log('[MK DEBUG] getMk called:', { idOrSlug, parsedId: id, cwd: process.cwd() });
  if (id === null) {
    console.log('[MK DEBUG] parseIdOrSlug returned null for:', idOrSlug);
    return null;
  }

  try {
    // Read directly from the public/data directory
    const filePath = path.join(process.cwd(), 'public', 'data', 'mks', `${id}.json`);
    console.log('[MK DEBUG] Reading file:', filePath);
    const data = await fs.readFile(filePath, 'utf-8');
    const mk = JSON.parse(data);
    console.log('[MK DEBUG] Found MK:', mk.name, 'id:', mk.id);
    return mk;
  } catch (err) {
    console.log('[MK DEBUG] File read error for id', id, ':', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: idOrSlug } = await params;
  const mk = await getMk(idOrSlug);
  
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

export async function generateStaticParams() {
  // Generate paths for all current MKs with friendly slugs
  const activeMksPath = path.join(process.cwd(), 'public', 'data', 'active-mk-ids.json');
  console.log('[MK DEBUG] generateStaticParams: reading active-mk-ids from', activeMksPath);
  const activeMksData = await fs.readFile(activeMksPath, 'utf-8');
  const activeMkIds: number[] = JSON.parse(activeMksData);
  console.log('[MK DEBUG] generateStaticParams: found', activeMkIds.length, 'active MK IDs');

  const params = [];
  for (const mkId of activeMkIds) {
    try {
      const mkPath = path.join(process.cwd(), 'public', 'data', 'mks', `${mkId}.json`);
      const mkData = await fs.readFile(mkPath, 'utf-8');
      const mk: MK = JSON.parse(mkData);
      const slug = generateUniqueSlug(mk.name, mk.id);
      params.push({ id: slug });
    } catch {
      // Skip if MK file not found
    }
  }

  console.log('[MK DEBUG] generateStaticParams: generated', params.length, 'params, first few:', params.slice(0, 3));
  return params;
}

export default async function MkProfilePage({ params }: Props) {
  const { id: idOrSlug } = await params;
  console.log('[MK DEBUG] MkProfilePage rendering for idOrSlug:', idOrSlug);
  const mk = await getMk(idOrSlug);

  if (!mk) {
    console.log('[MK DEBUG] getMk returned null, calling notFound() for:', idOrSlug);
    notFound();
  }

  // If accessed via numeric ID, redirect to friendly URL
  if (isNumericId(idOrSlug)) {
    const friendlySlug = getMkSlug(mk.id, mk.name);
    redirect(`/mks/${friendlySlug}`);
  }

  // Generate structured data
  const friendlyUrl = `${SITE_URL}/mks/${getMkSlug(mk.id, mk.name)}`;
  
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
    { name: mk.name, url: friendlyUrl },
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
