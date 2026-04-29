const RSS_URL = 'https://www.maariv.co.il/rss/rssfeedspolitimedini';
const MAX_ITEMS = 50;

export type FeedItem = {
  id: string;
  title: string;
  link: string;
  summary: string;
  imageUrl: string | null;
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

function parseItems(xml: string): FeedItem[] {
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

    const rawDate = extractText(block, 'pubDate');
    let publishedAt = new Date().toISOString();
    if (rawDate) {
      const parsed = new Date(rawDate);
      if (!isNaN(parsed.getTime())) publishedAt = parsed.toISOString();
    }

    return { id, title, link, summary, imageUrl, author, publishedAt, sourceName: 'מעריב', tags };
  });
}

export async function getMaarivFeed(): Promise<FeedItem[]> {
  try {
    const res = await fetch(RSS_URL, {
      next: { revalidate: 900 },
      headers: { 'User-Agent': 'vote-2026-bot/1.0' },
    });

    if (!res.ok) {
      console.error('[feed] Maariv RSS request failed', {
        status: res.status,
        statusText: res.statusText,
        url: RSS_URL,
      });
      return [];
    }

    const xml = await res.text();
    return parseItems(xml);
  } catch (error) {
    console.error('[feed] Maariv RSS request threw', { url: RSS_URL, error });
    return [];
  }
}
