import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getMkServer, getActiveMkIds } from '@/lib/mk-server';
import { MkProfileLayout } from './MkProfileLayout';
import { generateMkMetadata, generateMkStructuredData, generateBreadcrumbStructuredData } from '@/lib/seo';
import { SITE_URL } from '@/lib/constants';
import { getMkSlug, isNumericId, generateUniqueSlug } from '@/lib/slugs';
import type { MK } from '@/types';

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateStaticParams() {
  const ids = await getActiveMkIds();
  const params = [];
  for (const mkId of ids) {
    const mk = await getMkServer(String(mkId));
    if (mk) params.push({ id: generateUniqueSlug(mk.name, mk.id) });
  }
  return params;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: idOrSlug } = await params;
  const mk = await getMkServer(idOrSlug);
  if (!mk) {
    // Admin-owned brief share links may use /mks/0 as a placeholder path.
    if (idOrSlug === '0') return {};
    return { title: 'חבר כנסת לא נמצא' };
  }
  return generateMkMetadata({ id: mk.id, name: mk.name, faction: mk.faction, position: mk.position, bio: mk.bio });
}

export default async function Layout({ params, children }: Props) {
  const { id: idOrSlug } = await params;
  const mk = await getMkServer(idOrSlug);

  if (!mk) {
    // Keep legacy/admin shared brief URLs like /mks/0/briefs/:id functional.
    if (idOrSlug === '0') return <>{children}</>;
    notFound();
  }

  if (isNumericId(idOrSlug)) {
    redirect(`/mks/${getMkSlug(mk.id, mk.name)}`);
  }

  const friendlyUrl = `${SITE_URL}/mks/${getMkSlug(mk.id, mk.name)}`;
  const personSchema = generateMkStructuredData({
    id: mk.id, name: mk.name, faction: mk.faction, position: mk.position,
    email: mk.email, dateOfBirth: mk.dateOfBirth, placeOfBirth: mk.placeOfBirth, images: mk.images,
  });
  const breadcrumbSchema = generateBreadcrumbStructuredData([
    { name: 'בית', url: SITE_URL },
    { name: 'חברי כנסת', url: `${SITE_URL}/mks` },
    { name: mk.name, url: friendlyUrl },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <MkProfileLayout mk={mk}>{children}</MkProfileLayout>
    </>
  );
}
