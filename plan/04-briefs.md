# mk brief — מסר / מסרים

Every MK gets a public space to publish briefs to journalists and the public.

---

## 1. Routing — tabs → nested routes

All MK detail tabs become routes.

```
/mks/[slug]                    → overview (as-is, no redirect)
/mks/[slug]/bio                → ביוגרפיה
/mks/[slug]/gallery            → גלריה
/mks/[slug]/briefs             → list of MK's published briefs (ISR)
/mks/[slug]/briefs/[briefId]   → single brief — public, shareable, SEO (ISR)

/mk/dashboard                  → MK editor (brief list + create/edit)
/admin                         → admin dashboard (role-checked)
```

Implementation: replace `useState` tabs in `MkProfileClient.tsx` with a nested layout + `useSelectedLayoutSegment`.

  Q: For the MK dashboard at `/mk/dashboard` — should the URL include the MK's slug (e.g., `/mk/[slug]/dashboard`) so it's human-readable, or is a plain `/mk/dashboard` fine (identity derived from session)?

---

## 2. Brief templates

Two templates chosen at creation — cannot switch after.

Both share:
- Header image / banner
- Title
- Rich text body (Tiptap — good RTL/Hebrew support)
- Tags (free-form, with a hardcoded suggestion list)
- Optional embedded video (YouTube / Vimeo URL)
- Metadata: author MK, publish date, social share buttons

**Template A — הצהרה (Statement)**: title + subtitle + long-form text body + header image
**Template B — פוסט מדיה (Media post)**: full-width banner + title + image gallery grid + shorter text body

  Q: Are "הצהרה" and "פוסט מדיה" the right Hebrew names, or do you want different ones?
  Q: Tags — what's the hardcoded suggestion list? (e.g., כלכלה, ביטחון, חינוך, בריאות, דיור, חקיקה, חוץ, רווחה — confirm or adjust)

---

## 3. Auth — Supabase

Stack confirmed: **Supabase Auth + Postgres + Storage**.

**Invite flow**:
1. Admin runs a script → reads MK emails from JSON → creates Supabase Auth users with auto-generated passwords → sends branded invite email (custom template with site logo)
2. MK clicks link → forced password reset on first login
3. MKs with missing email → appear in the admin MKs list with a filter ("without email") — admin copies the manual invite link per MK

**Roles** (stored as Supabase custom claims or a `user_roles` table):
- `mk` — can manage own briefs only
- `admin` — full access

---

## 4. Database schema

**Answer to your question — mk and party tables**:
We do NOT duplicate the full MK/party JSON data into Postgres. That data is already canonical in the JSON files and synced to `/public/data/`. Instead, we add only a thin `mk_users` table to link an auth user to an MK ID, plus `party_id` for efficient DB-level filtering without a full parties table.

```sql
-- links auth.users → MK JSON id; populated by the invite script
mk_users
  id          uuid PK default gen_random_uuid()
  user_id     uuid FK → auth.users (unique)
  mk_id       int  unique  -- matches the integer id in MK JSON files
  party_id    int           -- from JSON, stored here for DB-level filtering
  created_at  timestamptz default now()

briefs
  id            uuid PK default gen_random_uuid()
  mk_id         int  FK → mk_users.mk_id
  author_id     uuid FK → auth.users
  template      text check (template in ('statement','media-rich'))
  status        text check (status in ('draft','published','deleted')) default 'draft'
  title         text not null
  subtitle      text
  body          text        -- Tiptap HTML
  header_image  text        -- Supabase Storage URL
  video_url     text        -- YouTube / Vimeo embed URL
  tags          text[]      -- free-form tag array
  publish_at    timestamptz -- null = publish immediately on status change
  deleted_at    timestamptz -- soft delete timestamp
  created_at    timestamptz default now()
  updated_at    timestamptz default now()

brief_media
  id         uuid PK default gen_random_uuid()
  brief_id   uuid FK → briefs(id) on delete cascade
  url        text not null   -- Supabase Storage URL
  alt        text
  sort_order int  default 0
  created_at timestamptz default now()
```

RLS policies:
- `mk` role: SELECT/INSERT/UPDATE/DELETE own rows only (where `mk_id = auth.uid()`'s mk_id)
- MKs can restore own soft-deleted briefs (set `deleted_at = null`, `status = 'draft'`)
- `admin` role: full access on all tables

---

## 5. Media — Supabase Storage

- Bucket: `briefs` (public reads, authenticated writes)
- Path: `briefs/{mkId}/{briefId}/{filename}`
- Accepted: JPEG, PNG, WebP, AVIF
- Max per image: 10 MB
- Auto-transform: serve via Supabase image transform (`?width=1200`) — no separate resize step needed
- Videos: embed URL only (YouTube / Vimeo), no upload

---

## 6. Admin dashboard — `/admin`

Route-guarded by `admin` role.

**MKs list** (user management):
- All MKs from JSON, enriched with Supabase `mk_users` join
- Filter: invited / not invited / missing email
- Actions per MK: send invite, reset password, revoke access
- Copy manual invite link for MKs without email

**Briefs list**:
- All briefs across all MKs
- Filters: MK name, party, status (draft/published/deleted), date range
- Admin actions: change status only (publish / unpublish / delete / restore) — no content editing

---

## 7. Implementation order (suggested)

1. Supabase project setup — Auth, DB schema, Storage bucket, RLS policies
2. Routing refactor — tabs → nested routes in `/mks/[slug]`
3. Invite script — reads JSON emails, creates Supabase users, sends branded email
4. MK dashboard `/mk/dashboard` — brief list, create/edit/delete flow, Tiptap editor, template picker
5. Media upload — Supabase Storage integration, image picker in editor
6. Public brief pages — `/mks/[slug]/briefs` + `/mks/[slug]/briefs/[briefId]` with ISR
7. Admin dashboard `/admin` — MKs list + briefs list with filters
