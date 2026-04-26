import { NextRequest, NextResponse } from 'next/server';

// Map common Hebrew tags to English search terms for Unsplash
const HEBREW_TO_EN: Record<string, string> = {
  פוליטיקה: 'politics government',
  כלכלה: 'economy finance',
  ביטחון: 'security defense military',
  חינוך: 'education school',
  בריאות: 'health medicine hospital',
  דיור: 'housing apartment building',
  חקיקה: 'parliament legislation law',
  חוץ: 'foreign affairs diplomacy',
  רווחה: 'welfare social care',
  חברה: 'society community people',
  סביבה: 'environment nature green',
  תחבורה: 'transportation road infrastructure',
  טכנולוגיה: 'technology innovation digital',
  ספורט: 'sport athletic',
  תרבות: 'culture art',
  דת: 'religion faith',
  'שלטון מקומי': 'local government municipality',
  משפט: 'justice court law',
  'זכויות אדם': 'human rights',
  'עלייה וקליטה': 'immigration integration',
  תקציב: 'budget finance government spending',
  שחיתות: 'corruption protest',
  הייטק: 'high tech startup innovation',
  חקלאות: 'agriculture farming',
  אנרגיה: 'energy renewable solar',
};

export interface PhotoSuggestion {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  alt: string;
  credit: string;
  creditUrl: string;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const rawQuery = searchParams.get('q') ?? '';

  // Translate Hebrew tags; fall back to raw query
  const translated = rawQuery
    .split(/[\s,]+/)
    .map((word) => HEBREW_TO_EN[word] ?? word)
    .join(' ')
    .trim();

  const query = translated || 'news politics';

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    return NextResponse.json({ error: 'UNSPLASH_ACCESS_KEY not configured' }, { status: 503 });
  }

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '12');
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${accessKey}` },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Unsplash request failed' }, { status: res.status });
  }

  const data = await res.json();

  const photos: PhotoSuggestion[] = (data.results ?? []).map((p: {
    id: string;
    urls: { small: string; regular: string };
    alt_description: string | null;
    user: { name: string; links: { html: string } };
  }) => ({
    id: p.id,
    thumbUrl: p.urls.small,
    fullUrl: p.urls.regular,
    alt: p.alt_description ?? '',
    credit: p.user.name,
    creditUrl: `${p.user.links.html}?utm_source=vote2026&utm_medium=referral`,
  }));

  return NextResponse.json({ photos });
}
