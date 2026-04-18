# Meme Generator — Implementation Plan

> **Status:** Decisions locked — ready to implement.

---

## Decisions

| Topic | Decision |
|-------|----------|
| Image source | All photos from `data/photos/{mkId}/*.jpg`, not just `profile.jpg` |
| Gallery filter | MK dropdown with search (reuse `MkSelector` pattern from `/compare`) |
| Gallery paging | Infinite scroll — load photos in batches |
| Canvas | Raw HTML5 Canvas API — no library |
| Editor routing | `/meme-generator` gallery → `/meme-generator/[mkId]` editor |
| Starting lines | 1 empty line |
| Random text pool | Hardcoded list (see Phase 4) |
| Sharing | Share link to `/meme-generator/[mkId]/view?meme=<encoded-state>` — no server upload |
| Mobile drag | Full touch drag & drop support |
| State | React `useState` / `useReducer` — no external store needed |

---

## Routes

```
/meme-generator                          → Gallery (all photos, infinite scroll)
/meme-generator/[mkId]/[photoId]         → Editor page
/meme-generator/[mkId]/[photoId]/view    → Read-only meme viewer (for sharing)
```

The `view` route receives meme state via a `?meme=` query param (base64-encoded JSON of `MemeState`). It renders the canvas client-side with no editing controls — just the meme image, share/download buttons, and an **Edit** button.  
The Edit button navigates back to `/meme-generator/[mkId]/[photoId]?meme=<base64>`, pre-loading the same state into the editor.  
This URL is what gets shared to WhatsApp / Facebook.

---

## Data Structures

```ts
// Per-line state
interface MemeLine {
  txt: string;
  size: number;       // px
  color: string;      // CSS color
  fontFamily: string;
  align: 'left' | 'center' | 'right';
  x: number;          // canvas %  (0–1), set after first render
  y: number;          // canvas %  (0–1)
}

// Top-level meme state
interface MemeState {
  mkId: number;
  imgUrl: string;
  selectedLineIdx: number;
  lines: MemeLine[];
}
```

---

## Phase 1 — Gallery + Basic Editor (MVP)

### Gallery (`/meme-generator`)

- Grid of **all** MK photos (`data/photos/{mkId}/*.jpg` — not just `profile.jpg`).
- MK dropdown filter with text search — reuse `MkSelector` component from `/compare/page.tsx`. When an MK is selected, the grid jumps to / filters their photos.
- Infinite scroll — pre-compute a shuffled photo list once on mount using round-robin interleave across MKs (so no MK dominates early results), then slice in batches of 40 via `IntersectionObserver`.
- Clicking a photo navigates to `/meme-generator/[mkId]/[photoId]`.

### Editor (`/meme-generator/[mkId]`)

- Canvas fills available width; image drawn to fit.
- Single text line rendered on canvas, updates live on input.
- Controls: text input, color picker, font-size +/−, download button.
- Download: `canvas.toDataURL('image/jpeg')` → `<a download>` click.

---

## Phase 2 — Multi-line & Line Management

- Add line / Delete line / Switch line buttons.
- Frame (stroke rect) drawn around the selected line's bounding box.
- Font family selector (Arial, Impact, David, Frank Ruhl).
- Text alignment (left / center / right).
- Editor controls always reflect the selected line.

---

## Phase 3 — Click-to-Select

- Each `MemeLine` stores `x`, `y` as canvas fractions; bounding box computed from `measureText`.
- `canvas.onClick` → hit-test all lines → select the matching line.
- Controls update to reflect clicked line immediately.

---

## Phase 4 — Random Meme ("צור רנדומלי")

Button in the gallery: picks a random MK + a random line from this pool, navigates to the editor pre-filled.

**Funny text pool (Hebrew political):**

1. "אני לא יודע כלום, אבל יש לי דעה חזקה"
2. "הצבעתם לי? טעות שלכם"
3. "התקציב אושר. הכסף? פחות ברור"
4. "שוב? כן, שוב"
5. "הכנסת: המקום שבו חוקים נולדים ומיד מתבלבלים"
6. "אני בעד הציבור. איזה ציבור? עוד נראה"
7. "המיקרופון כבוי אבל הדעות דולקות"
8. "סיעה? אנחנו משפחה. לפעמים"
9. "הצעת חוק מס׳ 847 – גם אני לא קראתי אותה"
10. "שאלות? כן. תשובות? נחזור אליכם"
11. "לא פוליטיקה — זה אידיאולוגיה. (אותו דבר)"
12. "הפגרה הרשמית: אני כל הזמן בפגרה"
13. "בחרתם בי כי הייתי הכי פחות גרוע"
14. "קואליציה זה אהבה. קואליציה זה כסף"
15. "אני שומע את הציבור. הציבור לא שומע אותי"
16. "חוק חשוב עבר הלילה. תשמעו מחר"
17. "פה לא מדינת הלכה — פה מדינת ביורוקרטיה"
18. "אם לא הייתי כאן, מי היה מצביע בשבילי?"

---

## Phase 5 — Advanced Features

- **Stickers** — emoji-only lines, same `MemeLine` structure, larger default size.
- **Drag & drop** — mouse + touch events move lines; update `x`/`y` on `pointerup`.
- **Upload custom image** — `<input type="file" accept="image/*">` → `FileReader` → canvas.
- **Share to WhatsApp** — `whatsapp://send?text=<view-url>` where the view URL is `/meme-generator/[mkId]/[photoId]/view?meme=<base64>`.
- **Share to Facebook** — `https://www.facebook.com/sharer/sharer.php?u=<view-url>`.
- **Inline canvas editing** — overlay a transparent `<textarea>` positioned over the selected line.
- **Line rotation** — add `rotation: number` (degrees) to `MemeLine`; apply `ctx.rotate()` before drawing.
- **Multiple aspect ratios** — canvas size adapts to image ratio; letterbox with transparent padding.
- **Mobile responsive** — pointer events API handles both touch and mouse uniformly.

---

## File Structure (proposed)

```
webapp/src/app/meme-generator/
  page.tsx                         ← Gallery (infinite scroll, all photos)
  [mkId]/
    [photoId]/
      page.tsx                     ← Editor shell (server component)
      MemeEditor.tsx               ← 'use client' canvas editor
      view/
        page.tsx                   ← Read-only meme viewer (for sharing)
        MemeViewer.tsx             ← 'use client' renders canvas from ?meme= param
  _components/
    MkPhotoGrid.tsx                ← infinite-scroll photo grid
  _lib/
    useMemeState.ts                ← useReducer hook for MemeState
    memeCanvas.ts                  ← pure canvas drawing functions
    encodeMeme.ts                  ← base64 encode/decode MemeState for URLs
    randomLines.ts                 ← hardcoded funny text pool
    photos.ts                      ← enumerate all photos; exports getShuffledPhotos() (round-robin interleave across MKs, shuffled MK order)
```
