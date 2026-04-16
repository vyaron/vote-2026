import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { generateUniqueSlug } from '@/lib/slugs';

interface MkBasic {
  id: number;
  name: string;
}

interface PartyBasic {
  id: number;
  name: string;
  isCurrent: boolean;
}

// Get all MKs with names from the data
async function getAllMks(): Promise<MkBasic[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const idsRes = await fetch(`${baseUrl}/data/active-mk-ids.json`, { 
      cache: 'force-cache' 
    });
    if (!idsRes.ok) return [];
    const ids: number[] = await idsRes.json();
    
    // Fetch MK data to get names
    const mks: MkBasic[] = [];
    for (const id of ids) {
      try {
        const mkRes = await fetch(`${baseUrl}/data/mks/${id}.json`, { cache: 'force-cache' });
        if (mkRes.ok) {
          const mk = await mkRes.json();
          mks.push({ id: mk.id, name: mk.name });
        }
      } catch {
        // Skip if MK data unavailable
      }
    }
    return mks;
  } catch {
    return [];
  }
}

// Get all parties with names
async function getAllParties(): Promise<PartyBasic[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/data/parties/factions.json`, { 
      cache: 'force-cache' 
    });
    if (!res.ok) return [];
    const parties: PartyBasic[] = await res.json();
    return parties.filter(p => p.isCurrent);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mks = await getAllMks();
  const parties = await getAllParties();
  
  const currentDate = new Date().toISOString();
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/mks`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/parties`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
  
  // MK profile pages with friendly URLs
  const mkPages: MetadataRoute.Sitemap = mks.map((mk) => ({
    url: `${SITE_URL}/mks/${generateUniqueSlug(mk.name, mk.id)}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Party pages with friendly URLs
  const partyPages: MetadataRoute.Sitemap = parties.map((party) => ({
    url: `${SITE_URL}/parties/${generateUniqueSlug(party.name, party.id)}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  return [...staticPages, ...mkPages, ...partyPages];
}
