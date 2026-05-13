import express from 'express';

const PORT = process.env.PORT || 3001;
const MAARIV_RSS_URL = 'https://www.maariv.co.il/rss/rssfeedspolitimedini';

const app = express();

// Cache the RSS feed for 15 minutes to avoid hammering Maariv
let cachedRss: { data: string; timestamp: number } | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

app.get('/rss', async (req, res) => {
  try {
    // Check cache
    if (cachedRss && Date.now() - cachedRss.timestamp < CACHE_TTL) {
      console.log('[rss-proxy] Serving cached RSS');
      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=900');
      return res.send(cachedRss.data);
    }

    console.log('[rss-proxy] Fetching fresh RSS from Maariv');
    const response = await fetch(MAARIV_RSS_URL, {
      headers: {
        'User-Agent': 'vote-2026-bot/1.0',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('[rss-proxy] Failed to fetch RSS', {
        status: response.status,
        statusText: response.statusText,
      });
      return res.status(502).json({
        error: 'Failed to fetch Maariv RSS',
        status: response.status,
      });
    }

    const rssData = await response.text();

    // Cache it
    cachedRss = { data: rssData, timestamp: Date.now() };

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=900');
    res.send(rssData);
  } catch (error) {
    console.error('[rss-proxy] Error fetching RSS', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.listen(PORT, () => {
  console.log(`[rss-proxy] Listening on http://localhost:${PORT}`);
  console.log(`[rss-proxy] RSS endpoint: http://localhost:${PORT}/rss`);
  console.log(`[rss-proxy] Health check: http://localhost:${PORT}/health`);
  console.log(`[rss-proxy] Use ngrok to expose: ngrok http ${PORT}`);
});
