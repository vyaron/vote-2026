const RSS_URL = 'https://www.maariv.co.il/rss/rssfeedspolitimedini';
const FALLBACK_RSS_URL =
  'https://news.google.com/rss/search?q=site%3Amaariv.co.il%20%D7%A4%D7%95%D7%9C%D7%99%D7%98%D7%99&hl=he&gl=IL&ceid=IL%3Ahe';
const MAX_ITEMS = 50;
const MAX_UNSPLASH_SUGGESTIONS = 8;

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
  משפט: 'justice court law',
  תקציב: 'budget finance government spending',
  שחיתות: 'corruption protest',
  הייטק: 'high tech startup innovation',
  חקלאות: 'agriculture farming',
  אנרגיה: 'energy renewable solar',
};

export type FeedItem = {
  id: string;
  title: string;
  link: string;
  summary: string;
  imageUrl: string | null;
  imageAttributionName?: string;
  imageAttributionUrl?: string;
  author: string;
  publishedAt: string;
  sourceName: string;
  tags: string[];
};

function extractText(xml: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = xml.match(re);
  if (!m) return '';
  return m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractImageFromDescription(description: string): string | null {
  // description may contain entity-encoded HTML — decode first
  const decoded = decodeHtmlEntities(description);
  const m = decoded.match(/<img[^>]+src=['"]([^'"]+)['"]/i);
  return m ? m[1] : null;
}

function cleanDescription(description: string): string {
  // 1. Decode entities so we can see the actual tags
  const decoded = decodeHtmlEntities(description);
  // 2. Strip all HTML tags
  const stripped = stripHtml(decoded);
  // 3. Decode any remaining entities (e.g. &amp; surviving in text nodes)
  return decodeHtmlEntities(stripped);
}

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function parseItems(xml: string, defaultSourceName = 'מעריב'): FeedItem[] {
  const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/gi) ?? [];
  return itemBlocks.slice(0, MAX_ITEMS).map((block) => {
    const id =
      extractText(block, 'itemID') ||
      extractText(block, 'guid') ||
      String(Math.random());

    const title = decodeHtmlEntities(stripHtml(extractText(block, 'title')));
    const link = extractText(block, 'link').replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim();
    const rawDescription = extractText(block, 'description');
    const imageUrl = extractImageFromDescription(rawDescription);
    const summary = cleanDescription(rawDescription);
    const author = extractText(block, 'Author') || extractText(block, 'author') || '';
    const rawTags = extractText(block, 'Tags') || extractText(block, 'tags') || '';
    const tags = parseTags(rawTags);
    const sourceName = decodeHtmlEntities(stripHtml(extractText(block, 'source'))) || defaultSourceName;

    const rawDate = extractText(block, 'pubDate');
    let publishedAt = new Date().toISOString();
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) publishedAt = parsed.toISOString();
    }

    return { id, title, link, summary, imageUrl, author, publishedAt, sourceName, tags };
  });
}

function buildUnsplashQuery(item: FeedItem): string {
  const raw = [item.tags.join(' '), item.title]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (!raw) return 'israel politics news';

  const translated = raw
    .split(/[\s,]+/)
    .map((word) => HEBREW_TO_EN[word] ?? word)
    .join(' ')
    .trim();

  return translated || 'israel politics news';
}

type UnsplashSuggestion = {
  imageUrl: string;
  attributionName: string;
  attributionUrl: string;
};

async function fetchUnsplashImage(query: string): Promise<UnsplashSuggestion | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '1');
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('content_filter', 'high');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Client-ID ${accessKey}` },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return null;

  const data = await res.json() as {
    results?: Array<{
      urls?: { regular?: string; small?: string };
      user?: { name?: string; links?: { html?: string } };
    }>;
  };
  const first = data.results?.[0];
  const imageUrl = first?.urls?.regular ?? first?.urls?.small;
  const attributionName = first?.user?.name;
  const userProfile = first?.user?.links?.html;

  if (!imageUrl || !attributionName || !userProfile) return null;

  return {
    imageUrl,
    attributionName,
    attributionUrl: `${userProfile}?utm_source=vote2026&utm_medium=referral`,
  };
}

async function addSuggestedImages(items: FeedItem[]): Promise<FeedItem[]> {
  if (!items.some((item) => !item.imageUrl)) return items;
  if (!process.env.UNSPLASH_ACCESS_KEY) return items;

  const cache = new Map<string, UnsplashSuggestion | null>();
  const result: FeedItem[] = [];
  let suggested = 0;

  for (const item of items) {
    if (item.imageUrl || suggested >= MAX_UNSPLASH_SUGGESTIONS) {
      result.push(item);
      continue;
    }

    const query = buildUnsplashQuery(item);
    let suggestion = cache.get(query);

    if (typeof suggestion === 'undefined') {
      suggestion = await fetchUnsplashImage(query);
      cache.set(query, suggestion ?? null);
    }

    if (suggestion) {
      suggested += 1;
      result.push({
        ...item,
        imageUrl: suggestion.imageUrl,
        imageAttributionName: suggestion.attributionName,
        imageAttributionUrl: suggestion.attributionUrl,
      });
    } else {
      result.push(item);
    }
  }

  if (suggested > 0) {
    console.info('[feed] Added Unsplash image suggestions', { count: suggested });
  }

  return result;
}

async function fetchRssItems(url: string, defaultSourceName: string): Promise<FeedItem[] | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      headers: {
        'User-Agent': 'vote-2026-bot/1.0',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
      },
    });

    if (!res.ok) {
      console.error('[feed] RSS request failed', {
        status: res.status,
        statusText: res.statusText,
        url,
      });
      return null;
    }

    const xml = await res.text();
    const items = parseItems(xml, defaultSourceName);
    if (items.length === 0) {
      console.error('[feed] RSS parsed with zero items', { url });
      return null;
    }

    return items;
  } catch (error) {
    console.error('[feed] RSS request threw', { url, error });
    return null;
  }
}

export async function getMaarivFeed(): Promise<FeedItem[]> {
  const primary = await fetchRssItems(RSS_URL, 'מעריב');
  if (primary) return addSuggestedImages(primary);

  const fallback = await fetchRssItems(FALLBACK_RSS_URL, 'מעריב (Google News)');
  if (fallback) {
    console.warn('[feed] Using fallback RSS source', { url: FALLBACK_RSS_URL });
    return addSuggestedImages(fallback);
  }

  return [];
}
