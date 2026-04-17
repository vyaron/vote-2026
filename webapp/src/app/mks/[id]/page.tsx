import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import { MkProfileClient } from './MkProfileClient';
import type { MK } from '@/types';
import { generateMkMetadata, generateMkStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { parseIdOrSlug, getMkSlug, isNumericId, generateUniqueSlug } from '@/lib/slugs';

interface Props {
  params: Promise<{ id: string }>;
}

async function getMk(idOrSlug: string): Promise<MK | null> {
  const id = parseIdOrSlug(idOrSlug);
  if (id === null) return null;

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'mks', `${id}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
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
  const activeMksPath = path.join(process.cwd(), 'public', 'data', 'active-mk-ids.json');
  const activeMksData = await fs.readFile(activeMksPath, 'utf-8');
  const activeMkIds: number[] = JSON.parse(activeMksData);

  const params = [];
  for (const mkId of activeMkIds) {
    try {
      const mkPath = path.join(process.cwd(), 'public', 'data', 'mks', `${mkId}.json`);
      const mkData = await fs.readFile(mkPath, 'utf-8');
      const mk: MK = JSON.parse(mkData);
      params.push({ id: generateUniqueSlug(mk.name, mk.id) });
    } catch {
      // Skip if MK file not found
    }
  }

  return params;
}

export default async function MkProfilePage({ params }: Props) {
  const { id: idOrSlug } = await params;
  const mk = await getMk(idOrSlug);

  if (!mk) {
    notFound();
  }

  // If accessed via numeric ID, redirect to friendly URL
  if (isNumericId(idOrSlug)) {
    const friendlySlug = getMkSlug(mk.id, mk.name);
    redirect(`/mks/${friendlySlug}`);
  }

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
