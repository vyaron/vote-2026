/**
 * Application constants
 */

// Site metadata
export const SITE_NAME = 'בחירות 2026';
export const SITE_DESCRIPTION = 'מידע מקיף על חברי הכנסת ה-26 של ישראל';
const _rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://voter-2026.vercel.app';
export const SITE_URL = _rawSiteUrl.startsWith('http') ? _rawSiteUrl : `https://${_rawSiteUrl}`;

// Navigation items
export const NAV_ITEMS = [
  { label: 'בית', href: '/' },
  { label: 'חברי כנסת', href: '/mks' },
  { label: 'מפלגות', href: '/parties' },
  { label: 'השוואה', href: '/compare' },
  { label: 'ממים', href: '/meme-generator' },
  { label: 'אודות', href: '/about' },
] as const;

// Knesset info
export const CURRENT_KNESSET = 25;
export const TOTAL_MKS = 120;

// Animation durations (ms)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  stagger: 50,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Hebrew months
export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
] as const;

// Gender labels
export const GENDER_LABELS = {
  male: 'זכר',
  female: 'נקבה',
} as const;

// Sort options for MK list
export const MK_SORT_OPTIONS = [
  { value: 'name', label: 'שם (א-ת)' },
  { value: 'name-desc', label: 'שם (ת-א)' },
  { value: 'party', label: 'מפלגה' },
  { value: 'age', label: 'גיל' },
] as const;

// View modes
export const VIEW_MODES = ['grid', 'list', 'compact'] as const;
export type ViewMode = typeof VIEW_MODES[number];

// Social media icons mapping
export const SOCIAL_ICONS = {
  facebook: 'Facebook',
  twitter: 'Twitter',
  instagram: 'Instagram',
  youtube: 'Youtube',
  website: 'Globe',
} as const;

// Placeholder image
export const PLACEHOLDER_IMAGE = '/images/placeholder-mk.png';

// Number of MKs per page in list view
export const MKS_PER_PAGE = 24;
