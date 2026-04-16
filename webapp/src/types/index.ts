/**
 * TypeScript types for Knesset data
 * Generated from scraped data structure
 */

// Social media links for an MK
export interface SocialLinks {
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  youtube: string | null;
  website: string | null;
}

// Image URLs for an MK
export interface MkImages {
  profile: string;
  lobby: string;
  banner: string;
  bannerMobile: string;
}

// Photo metadata
export interface MkPhoto {
  id: number;
  filename: string;
  localPath: string;
  originalUrl: string;
  width: number;
  height: number;
  title: string;
}

// Full MK data structure
export interface MK {
  id: number;
  name: string;
  fullTitle: string;
  faction: string;
  email: string | null;
  workPhone: string | null;
  homePhone: string | null;
  fax: string | null;
  socialLinks: SocialLinks;
  videoId: string | null;
  images: MkImages;
  gender: 'male' | 'female';
  dateOfBirth: string | null;
  deathDate: string | null;
  placeOfBirth: string | null;
  immigrationYear: string | null;
  residence: string | null;
  education: string | null;
  militaryService: string | null;
  nationalService: string | null;
  profession: string | null;
  languages: string[];
  bio: string;
  knessetId: number;
  plenumSeatNumber: string | null;
  isCurrentMk: boolean;
  isPresent: boolean;
  position: string | null;
  knessetsList: number[];
  photos: MkPhoto[];
  localImagePath?: string;
}

// Summary version of MK for lists
export interface MkSummary {
  id: number;
  name: string;
  faction: string;
  isCurrentMk: boolean;
  profileImage: string;
  gender?: 'male' | 'female';
  position?: string | null;
}

// Party/Faction data
export interface Party {
  id: number;
  name: string;
  knessetNum: number;
  startDate: string;
  finishDate: string | null;
  isCurrent: boolean;
  members: number[];
  scrapedAt: string;
}

// Committee data
export interface Committee {
  id: number;
  name: string;
  knessetNum: number;
  categoryId: number | null;
  categoryDescription: string | null;
  startDate: string | null;
  finishDate: string | null;
  additionalInfo: string | null;
}

// Party with computed data for display
export interface PartyWithMembers extends Party {
  memberCount: number;
  mks: MkSummary[];
  color: string;
}

// Stats for the dashboard
export interface KnessetStats {
  totalMks: number;
  currentMks: number;
  parties: number;
  committees: number;
  photos: number;
  maleCount: number;
  femaleCount: number;
  averageAge: number;
  lastUpdated: string;
}

// Party color mapping
export const PARTY_COLORS: Record<string, string> = {
  'הליכוד': 'var(--party-likud)',
  'יש עתיד': 'var(--party-yesh-atid)',
  'ש"ס': 'var(--party-shas)',
  'יהדות התורה': 'var(--party-yahadut)',
  'העבודה': 'var(--party-labor)',
  'מרצ': 'var(--party-meretz)',
  'רע"ם': 'var(--party-raam)',
  'הרשימה המשותפת': 'var(--party-joint-list)',
  'ישראל ביתנו': 'var(--party-yisrael-beiteinu)',
  'כחול לבן - הממלכתי': 'var(--party-mamlachti)',
  'הימין הממלכתי': 'var(--party-mamlachti)',
  'עוצמה יהודית': 'var(--party-otzma)',
  'נעם': 'var(--party-noam)',
  'הציונות הדתית': 'var(--party-otzma)',
};

// Get party color with fallback
export function getPartyColor(partyName: string): string {
  // Normalize party name (trim whitespace)
  const normalized = partyName.trim();
  
  // Check for exact match
  if (PARTY_COLORS[normalized]) {
    return PARTY_COLORS[normalized];
  }
  
  // Check for partial match
  for (const [key, color] of Object.entries(PARTY_COLORS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return color;
    }
  }
  
  // Fallback color
  return 'oklch(0.5 0.1 240)';
}

// Navigation item type
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

// Search result type
export interface SearchResult {
  type: 'mk' | 'party' | 'committee';
  id: number;
  name: string;
  subtitle?: string;
  image?: string;
}
