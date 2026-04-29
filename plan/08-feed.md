# Plan 08 — Feed: News Stream + Brief From News

## Goal
Add a feed page ("עדכוני חדשות") based on Maariv RSS, and allow an MK to pick a feed item and create a brief that quotes that item.

RSS source:
- https://www.maariv.co.il/rss/rssfeedspolitimedini

---

## Product Outcome
1. Users can browse a curated list of recent political news items.
2. MK users can click "צור בריף מהכתבה" from any feed item.
3. The brief creation flow is pre-filled with quote/source context from that feed item.
4. Published brief clearly indicates it is based on an external news item.

---

## Scope (V1)

### In scope
- Feed list page with title, image, summary, source, publish date.
- Server-side RSS fetch + parse + normalize.
- "Create brief from item" action for logged-in MK users.
- `mk/dashboard/new` prefill from selected feed item.
- Saved attribution fields in the brief payload (source URL, source title, quote excerpt).

### Out of scope (for now)
- Multi-source aggregation.
- Full-text article scraping from source pages.
- AI summary/rewrite pipeline.
- Ranking/personalization.

---

## UX Flow
1. MK opens Feed page.
2. MK clicks one feed card.
3. MK presses "צור בריף מהכתבה".
4. App routes to `mk/dashboard/new` with selected item payload.
5. Form opens with pre-filled fields and editable quoted excerpt.
6. MK edits and publishes brief.

---

## Technical Design

### 1. RSS ingestion
- Fetch RSS on the server (route handler or server utility).
- Parse XML safely.
- Normalize each item into an internal `FeedItem` shape:
    - `id` (guid/itemID fallback)
    - `title`
    - `link`
    - `summaryHtml` / `summaryText`
    - `imageUrl` (if present in description)
    - `author`
    - `publishedAt`
    - `sourceName` ("מעריב")
    - `tags[]`

### 2. Feed page
- New page in webapp navigation (name: "עדכוני חדשות").
- Render cards in RTL layout.
- Per item actions:
    - Read original article (external link).
    - Create brief from item (MK only).

### 3. Create-brief handoff
- On click, pass item context to `mk/dashboard/new`.
- Preferred transport for V1: query params with compact fields (or temporary server-side cache key if query gets too long).
- Prefilled form fields:
    - Brief title suggestion from item title.
    - Quote/source section from item summary.
    - Source URL + source publisher.

### 4. Brief data model impact
- Add optional fields to brief record (or JSON metadata block):
    - `source_type = "feed_item"`
    - `source_name`
    - `source_url`
    - `source_item_id`
    - `source_title`
    - `source_excerpt`
    - `source_published_at`

### 5. Permission model
- Feed is public read.
- "Create brief from item" visible only to authenticated MK users.
- Non-authenticated click redirects to login and returns to selected feed item context.

---

## Decisions (locked)

| # | Decision |
|---|---|
| Feed visibility | Public — accessible to everyone |
| Items per page | 50 |
| Cache TTL | 15 minutes (Next.js `revalidate: 900`) |
| Description HTML | Strip — render plain text only |
| Brief prefill | Full stripped summary, editable by MK |
| Brief type | New dedicated type `news_brief` with badge + filter |
| Source attribution | Always shown on published brief: link, publisher, date |
| External links | `target="_blank" rel="noopener noreferrer"` |
| Hebrew normalization | None needed |
| Moderation | None — no approval flow |
| Feed persistence | Cache only — no DB storage for feed items |
| Source metadata storage | JSONB field on briefs table (`source_meta`) |
| Prefill via query string | ✅ First use — `mk/dashboard/new/page.tsx` currently has no `searchParams` |
| Duplicate prevention | None |

---

## Revised Technical Design

### 1. RSS ingestion — `src/lib/feed/maariv.ts`
- `fetch()` the RSS URL server-side with `next: { revalidate: 900 }`.
- Parse XML with a lightweight parser (e.g. `fast-xml-parser`).
- Strip all HTML from `description` using a simple regex/DOM approach — no sanitizer library needed since we're discarding all tags.
- Extract thumbnail from `<img src=...>` inside description before stripping.
- Return up to 50 normalized `FeedItem` objects:

```ts
type FeedItem = {
  id: string;           // guid or itemID
  title: string;
  link: string;
  summary: string;      // plain text, stripped
  imageUrl: string | null;
  author: string;
  publishedAt: string;  // ISO string
  sourceName: string;   // "מעריב"
  tags: string[];
};
```

### 2. Feed page — `src/app/feed/page.tsx`
- Server component.
- Calls `getMaarivFeed()` — no client-side fetch.
- Renders `<FeedCard>` list.
- No auth check — public page.

### 3. `FeedCard` component — `src/components/feed/FeedCard.tsx`
- Displays: thumbnail, title, summary, author, date, tags.
- Two actions:
  - "קרא עוד" → `target="_blank" rel="noopener noreferrer"` link to original article.
  - "צור בריף" → visible only when MK user is logged in; links to `/mk/dashboard/new?source=feed&...`.
- Props include an `isMk: boolean` flag passed from the page server component.

### 4. Prefill handoff — `mk/dashboard/new`
Query string params passed to `/mk/dashboard/new`:
| Param | Value |
|---|---|
| `source` | `"feed"` |
| `sourceId` | feed item guid |
| `sourceTitle` | article title |
| `sourceUrl` | article URL |
| `sourceName` | `"מעריב"` |
| `sourcePublishedAt` | ISO date string |
| `sourceSummary` | stripped summary (URL-encoded, trimmed) |

- `NewBriefPage` gains `searchParams` prop.
- Parsed params forwarded to `<BriefForm>` as `feedContext?: FeedContext`.

### 5. `BriefForm` changes
- When `feedContext` is present:
  - Prefill `title` with article title (editable).
  - Show a non-editable **quoted source block** above the body editor: publisher name, date, summary excerpt, link.
  - `brief_type` defaults to `"news_brief"`.

### 6. Brief schema — JSONB `source_meta`
Add nullable `source_meta jsonb` column to `briefs` table:

```json
{
  "type": "feed_item",
  "name": "מעריב",
  "url": "https://...",
  "item_id": "1315124",
  "title": "...",
  "excerpt": "...",
  "published_at": "2026-04-29T03:00:43Z"
}
```

New migration: `supabase/migrations/YYYYMMDDHHMMSS_briefs_add_source_meta.sql`

### 7. `news_brief` badge
- Briefs list in `/mk/dashboard` and public MK page show a "מתוך חדשות" badge for `brief_type = 'news_brief'`.
- Source attribution block rendered in the brief view page.

---

## File Checklist

- [ ] `src/lib/feed/maariv.ts` — RSS fetch, parse, normalize (50 items, TTL 900s, strip HTML)
- [ ] `src/app/feed/page.tsx` — public server component feed page
- [ ] `src/components/feed/FeedCard.tsx` — card with "קרא עוד" + conditional "צור בריף"
- [ ] `src/app/mk/dashboard/new/page.tsx` — accept `searchParams`, parse feed context, pass to form
- [ ] `src/components/brief/BriefForm.tsx` — accept `feedContext` prop, prefill title + quoted block + type
- [ ] `src/components/brief/SourceQuoteBlock.tsx` — non-editable attribution display (reused in form + view)
- [ ] `supabase/migrations/*_briefs_add_source_meta.sql` — add `source_meta jsonb` column
- [ ] Brief persistence — save `source_meta` when submitting a `news_brief`
- [ ] Brief view page — render `<SourceQuoteBlock>` when `source_meta` present
- [ ] Briefs list — render "מתוך חדשות" badge for `news_brief` type

---

## Acceptance Criteria

- [ ] Feed page renders 50 items, no client-side XML parsing.
- [ ] Feed page is accessible without login.
- [ ] "צור בריף" button is hidden for non-MK users.
- [ ] Clicking "צור בריף" opens `mk/dashboard/new` with all fields pre-filled.
- [ ] Full summary is prefilled in the quoted source block (editable in body, non-editable in attribution header).
- [ ] Published brief stores `source_meta` JSONB and shows source attribution.
- [ ] `news_brief` badge visible on dashboard and public profile.
- [ ] External links use `rel="noopener noreferrer"`.
- [ ] Feed cache refreshes every 15 minutes (verify via `revalidate`).

---

## Notes
- `fast-xml-parser` is the recommended XML parser — small, no DOM dependency, safe for server use.
- Thumbnail extraction: regex `/<img[^>]+src=['"]([^'"]+)['"]/i` on raw description before stripping.
- `source_meta` is intentionally JSONB (not columns) to avoid a wider schema migration and keep flexibility for future RSS sources.
- RTL layout: feed cards should use `dir="rtl"`.

