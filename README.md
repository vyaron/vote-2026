# בחירות 2026 — Israel Elections 2026

> **Live site:** [voter-2026-o6nhh7n9w-vyarons-projects.vercel.app](https://voter-2026-o6nhh7n9w-vyarons-projects.vercel.app)

A Hebrew-language civic information platform for the 2026 Israeli Knesset elections.  
Browse all 120 Members of Knesset, compare candidates, follow official statements, and create shareable political memes.

---

## Features

### 🗂 MK Directory
Browse all 120 Knesset members with photos, party affiliation, and positions.  
Full-text search, party filter, and multiple sort options. Infinite scroll.

### 👤 MK Profiles
Each MK has a dedicated profile with:
- **Bio** — background, education, committees
- **Gallery** — curated photo library
- **Briefs** — official published statements

### 🏛 Party Browser
Explore all parties currently represented in the Knesset, with member rosters and party metadata.

### ⚖️ Side-by-Side Comparison
Select any two MKs and compare them across age, party, education, positions, and more.

### 📢 MK Briefs
MKs publish official statements and press releases directly on the platform.  
Each brief is a public, shareable, SEO-optimised page — designed for journalists and the public.  
Supports two templates: long-form Statement and Media Release with embedded video.

### 🎨 Meme Generator
Create political memes using official MK photos:
- Drag-and-drop multi-line Hebrew text with custom font, size, color, and rotation
- Emoji sticker picker
- Random funny-line generator
- **Download as PNG** for immediate sharing
- **Download as GIF** — fully animated, loops forever: Ken Burns zoom on the background photo, typewriter text entrance line by line, WhatsApp-compatible 400 px output
- **Download as MP4** — same animation in H.264, higher quality for other platforms
- Shareable link that reconstructs the exact meme from a URL parameter

### 🔐 MK Dashboard
Authenticated MK representatives can log in and publish, edit, and manage their briefs.

### 🛡 Admin Panel
Role-protected admin interface for managing MKs and all published content.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Database / Auth | Supabase (Postgres + Row-Level Security) |
| GIF encoding | gifenc (pure JS, client-side) |
| MP4 encoding | WebCodecs API + mp4-muxer (client-side, Chrome 94+) |
| Deployment | Vercel |
| Language | Hebrew (RTL), targeting Israeli voters |

---

## Project Structure

```
webapp/
  src/
    app/
      mks/              # MK directory + individual profiles
      parties/          # Party browser
      compare/          # Side-by-side comparison tool
      meme-generator/   # Meme editor, viewer, and gallery
      mk/dashboard/     # Authenticated MK brief editor
      admin/            # Admin panel
    lib/                # Data loading, SEO helpers, Supabase clients
    types/              # Shared TypeScript types
plan/                   # Feature planning docs (per-feature markdown)
```

---

## Running Locally

```bash
cd webapp
npm install
cp .env.local.example .env.local   # add Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
