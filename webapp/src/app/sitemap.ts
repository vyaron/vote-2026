import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

// Get all MK IDs from the data
async function getAllMkIds(): Promise<number[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/data/active-mk-ids.json`, { 
      cache: 'force-cache' 
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Get all party IDs
async function getAllPartyIds(): Promise<number[]> {
  // Based on the data structure, parties are associated with MKs
  // We'll return known party IDs
  return [1095, 1096, 1099, 1100, 1101, 1102, 1103, 1104, 1105, 1106, 1107, 1108, 1109];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const mkIds = await getAllMkIds();
  const partyIds = await getAllPartyIds();
  
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
  
  // MK profile pages
  const mkPages: MetadataRoute.Sitemap = mkIds.map((id) => ({
    url: `${SITE_URL}/mks/${id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));
  
  // Party pages
  const partyPages: MetadataRoute.Sitemap = partyIds.map((id) => ({
    url: `${SITE_URL}/parties/${id}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));
  
  return [...staticPages, ...mkPages, ...partyPages];
}
