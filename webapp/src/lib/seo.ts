/**
 * SEO utilities and metadata helpers
 */

import { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from './constants';

// Default metadata for the site
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'כנסת',
    'חברי כנסת',
    'ישראל',
    'פוליטיקה',
    'מפלגות',
    'בחירות',
    'דמוקרטיה',
    'פרלמנט',
    'חקיקה',
    'ממשלה',
  ],
  authors: [{ name: 'Knesset 2026 Team' }],
  creator: 'Knesset 2026',
  publisher: 'Knesset 2026',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      'he-IL': SITE_URL,
    },
  },
  verification: {
    // Add verification codes when available
    // google: 'your-google-verification-code',
  },
};

/**
 * Generate metadata for an MK profile page
 */
export function generateMkMetadata(mk: {
  id: number;
  name: string;
  faction: string;
  position?: string | null;
  bio?: string | null;
}): Metadata {
  const title = mk.name;
  const description = mk.position 
    ? `${mk.name} - ${mk.position} מסיעת ${mk.faction}. פרופיל מלא, תמונות ומידע.`
    : `${mk.name} - חבר/ת כנסת מסיעת ${mk.faction}. פרופיל מלא, תמונות ומידע.`;

  return {
    title,
    description,
    keywords: [mk.name, mk.faction, 'חבר כנסת', 'כנסת', 'ישראל'],
    openGraph: {
      title: `${mk.name} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/mks/${mk.id}`,
      type: 'profile',
      images: [
        {
          url: `/api/og/mk/${mk.id}`,
          width: 1200,
          height: 630,
          alt: mk.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${mk.name} | ${SITE_NAME}`,
      description,
      images: [`/api/og/mk/${mk.id}`],
    },
    alternates: {
      canonical: `${SITE_URL}/mks/${mk.id}`,
    },
  };
}

/**
 * Generate metadata for a party page
 */
export function generatePartyMetadata(party: {
  id: number;
  name: string;
  memberCount: number;
}): Metadata {
  const title = party.name;
  const description = `${party.name} - ${party.memberCount} חברי כנסת בכנסת ה-25. רשימת חברים, סטטיסטיקות ומידע.`;

  return {
    title,
    description,
    keywords: [party.name, 'מפלגה', 'סיעה', 'כנסת', 'ישראל'],
    openGraph: {
      title: `${party.name} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/parties/${party.id}`,
      type: 'website',
      images: [
        {
          url: `/api/og/party/${party.id}`,
          width: 1200,
          height: 630,
          alt: party.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${party.name} | ${SITE_NAME}`,
      description,
      images: [`/api/og/party/${party.id}`],
    },
    alternates: {
      canonical: `${SITE_URL}/parties/${party.id}`,
    },
  };
}

/**
 * Generate structured data for an MK (Person schema)
 */
export function generateMkStructuredData(mk: {
  id: number;
  name: string;
  faction: string;
  position?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  placeOfBirth?: string | null;
  images: { profile: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: mk.name,
    jobTitle: mk.position || 'חבר כנסת',
    worksFor: {
      '@type': 'Organization',
      name: 'הכנסת',
      url: 'https://knesset.gov.il',
    },
    memberOf: {
      '@type': 'PoliticalParty',
      name: mk.faction,
    },
    image: `${SITE_URL}/data/photos/${mk.id}/profile.jpg`,
    url: `${SITE_URL}/mks/${mk.id}`,
    email: mk.email || undefined,
    birthDate: mk.dateOfBirth || undefined,
    birthPlace: mk.placeOfBirth || undefined,
  };
}

/**
 * Generate structured data for a party (Organization schema)
 */
export function generatePartyStructuredData(party: {
  id: number;
  name: string;
  memberCount: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PoliticalParty',
    name: party.name,
    url: `${SITE_URL}/parties/${party.id}`,
    numberOfEmployees: party.memberCount,
    parentOrganization: {
      '@type': 'Organization',
      name: 'הכנסת',
      url: 'https://knesset.gov.il',
    },
  };
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    inLanguage: 'he-IL',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}
