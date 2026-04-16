/**
 * Fetch detailed MK information from Knesset WebSiteApi
 */

import { config } from '../config.js';
import { httpClient, logger } from '../utils/index.js';
import type { MK, MkHeaderResponse, MkContentResponse, MkPhoto } from '../types/index.js';

/**
 * Fetch MK header data
 */
export async function fetchMkHeader(mkId: number): Promise<MkHeaderResponse | null> {
  const url = `${config.baseUrl}${config.api.mkHeader}?mkId=${mkId}&languageKey=${config.languageKey}`;
  return httpClient.get<MkHeaderResponse>(url);
}

/**
 * Fetch MK content/details data
 */
export async function fetchMkContent(mkId: number): Promise<MkContentResponse | null> {
  const url = `${config.baseUrl}${config.api.mkContent}?mkId=${mkId}&languageKey=${config.languageKey}`;
  return httpClient.get<MkContentResponse>(url);
}

/**
 * Parse languages string into array
 */
function parseLanguages(languages: string | null): string[] {
  if (!languages) return [];
  return languages
    .split(/[,،]/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
}

/**
 * Parse gender from numeric code
 */
function parseGender(gender: number): 'male' | 'female' | 'unknown' {
  switch (gender) {
    case 1: return 'male';
    case 2: return 'female';
    default: return 'unknown';
  }
}

/**
 * Clean and trim string, return null if empty
 */
function cleanString(str: string | null | undefined): string | null {
  if (!str) return null;
  const cleaned = str.trim();
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Clean HTML entities and format text
 */
function cleanHtml(str: string | null | undefined): string | null {
  if (!str) return null;
  return str
    .replace(/&#x0D;\n/g, '\n')
    .replace(/&#x0D;/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Transform API responses into clean MK object
 */
export function transformMkData(
  header: MkHeaderResponse,
  content: MkContentResponse,
  photos: MkPhoto[] = []
): MK {
  return {
    id: header.ID,
    name: header.Name,
    fullTitle: header.MkName,
    faction: header.Faction,
    
    // Contact
    email: cleanString(header.Email),
    workPhone: cleanString(header.mk_work_phone),
    homePhone: cleanString(header.mk_home_phone),
    fax: cleanString(header.mk_fax),
    
    // Social Media
    socialLinks: {
      facebook: cleanString(header.Facebook),
      twitter: cleanString(header.Twitter),
      instagram: cleanString(header.Instagram),
      youtube: cleanString(header.Youtube),
      website: cleanString(header.Website),
    },
    
    // Videos
    videoId: cleanString(header.Video),
    
    // Images
    images: {
      profile: header.MkImage || '',
      lobby: header.LobbyImage || '',
      banner: header.BannerImage || '',
      bannerMobile: header.BannerMobile || '',
    },
    
    // Personal Info
    gender: parseGender(header.Gender),
    dateOfBirth: cleanString(content.DateOfBirth),
    deathDate: cleanString(content.DeathDate),
    placeOfBirth: cleanString(content.PlaceOfBirth),
    immigrationYear: cleanString(content.ImmigrationYear),
    residence: cleanString(content.Residence),
    
    // Background
    education: cleanHtml(content.Education),
    militaryService: cleanString(content.MilitaryService),
    nationalService: cleanString(content.NationalService),
    profession: cleanString(content.profession),
    languages: parseLanguages(content.Languages),
    bio: cleanHtml(content.Content),
    
    // Knesset Info
    knessetId: header.KnessetId,
    plenumSeatNumber: cleanString(content.PlenumSeatNumber),
    isCurrentMk: header.IsCurrentMk,
    isPresent: header.IsPresent,
    position: cleanString(header.Position),
    knessetsList: header.KnessetsList || [],
    
    // Photos
    photos,
    
    // Metadata
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Fetch and transform complete MK data
 */
export async function fetchMkDetails(mkId: number): Promise<MK | null> {
  logger.debug(`Fetching details for MK ${mkId}`, 'MkDetails');
  
  const [header, content] = await Promise.all([
    fetchMkHeader(mkId),
    fetchMkContent(mkId),
  ]);
  
  if (!header || !content) {
    logger.warn(`Failed to fetch data for MK ${mkId}`, 'MkDetails');
    return null;
  }
  
  return transformMkData(header, content);
}
