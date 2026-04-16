// Configuration for Knesset scraper

export const config = {
  // Base URLs
  baseUrl: 'https://www.knesset.gov.il',
  mainPageUrl: 'https://main.knesset.gov.il/mk/apps/mklobby/main/current-knesset-mks/all-current-mks',
  
  // API Endpoints
  api: {
    mkHeader: '/WebSiteApi/knessetapi/MKs/GetMkdetailsHeader',
    mkContent: '/WebSiteApi/knessetapi/MKs/GetMkDetailsContent',
    mkImages: '/WebSiteApi/knessetapi/SpList/GetMKImages/',
  },
  
  // OData API (for voting, bills, etc.)
  odata: {
    baseUrl: 'https://knesset.gov.il/Odata/ParliamentInfo.svc',
  },
  
  // Rate limiting
  delayMs: 750, // Delay between requests in milliseconds
  
  // Output paths (relative to project root)
  output: {
    dataDir: '../data',
    mksDir: '../data/mks',
    photosDir: '../data/photos',
    partiesDir: '../data/parties',
  },
  
  // Language
  languageKey: 'he',
  
  // Scope
  knessetRange: {
    current: 26,
    oldest: 20, // Last 7 Knessets (20-26)
  },
} as const;

export type Config = typeof config;
