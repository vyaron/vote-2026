# Feature: Animated GIF + MP4 Export for Meme Generator

## Decisions locked in

| # | Decision |
|---|---|
| Background | Ken Burns — slow zoom (scale 1.0 → 1.05) throughout the clip |
| Text entrance | Typewriter — characters appear one by one |
| Timing between lines | 0.7 s pause after each line finishes |
| Loop | Hold 1.5 s on final frame → fade everything out over 0.5 s → jump-cut to start |
| Output size | 400 px wide, height proportional to original aspect ratio |
| Export button | "GIF" + "MP4" buttons added next to the existing "הורד" (PNG) in MemeEditor |
| Encoding | Server-side — Next.js API route using `ffmpeg-static` |
| Frame rate | 24 fps |
| Outputs | Both GIF (WhatsApp) and MP4 (other share targets) |

---

## Animation timing model

```
t=0 ──── line 1 typewriter ──── t=T1
         pause 0.7 s
         line 2 typewriter ──── t=T2
         pause 0.7 s
         …
         line N finishes ──── t=Thold_start
         hold 1.5 s ──── t=Tfade_start
         fade out 0.5 s ──── t=Ttotal  →  loop
```

Constants (in `animationTimeline.ts`):
```ts
const CHAR_DURATION   = 0.07  // seconds per character
const MAX_LINE_DUR    = 2.5   // cap so very long lines don't drag forever
const PAUSE           = 0.7   // seconds between lines
const HOLD            = 1.5   // seconds to hold on finished meme
const FADE            = 0.5   // seconds for fade-out
const FPS             = 24
const OUTPUT_WIDTH    = 400   // px; height is proportional
```

---

## Files to create

### 1. `webapp/src/app/meme-generator/_lib/animationTimeline.ts`

Pure TS — no browser or Node deps. Used by both client (preview) and server (encoding).

```ts
export interface LineSlot {
  lineIdx: number
  start: number   // seconds
  end: number     // seconds — typewriter fully shown
}

export interface AnimTimeline {
  slots: LineSlot[]
  holdStart: number
  fadeStart: number
  totalDuration: number
  frameCount: number  // Math.ceil(totalDuration * FPS)
}

export function buildTimeline(lines: MemeLine[]): AnimTimeline
```

`buildTimeline` walks the non-empty lines, assigns `start`/`end` per line based on
`min(txt.length * CHAR_DURATION, MAX_LINE_DUR)` plus PAUSE gaps, then appends HOLD and FADE.

```ts
// Per-frame query helper
export interface FrameState {
  kenBurnsScale: number          // 1.0 → 1.05 linearly with t
  lineTexts: string[]            // partial text for typewriter, full when done
  globalAlpha: number            // 1.0 normally; ramps 1→0 during fade-out
}

export function getFrameState(timeline: AnimTimeline, t: number, allLines: MemeLine[]): FrameState
```

---

### 2. `webapp/src/app/meme-generator/_lib/renderAnimationFrame.ts`

Browser-only (uses Canvas API). Called from the client to collect frames for the server POST.

```ts
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lines: MemeLine[],
  state: FrameState,    // from getFrameState()
): void
```

Internals:
- Ken Burns: `ctx.save()` → `ctx.scale(scale, scale)` around the image center → `ctx.drawImage(img, ...)` → `ctx.restore()`
- Per line: call the existing `drawLine()` from `memeCanvas.ts` but pass `{ ...line, txt: state.lineTexts[i] }`
- Fade: wrap everything in `ctx.globalAlpha = state.globalAlpha`

---

### 3. `webapp/src/app/api/meme-animation/route.ts`

Next.js App Router POST handler.

Request body (`multipart/form-data` or JSON):
```ts
{
  frames: string[]   // base64 JPEG, one per frame (24 fps)
  format: 'gif' | 'mp4' | 'both'
  filename: string   // e.g. "meme-גנץ"
}
```

Steps:
1. Write frames to a temp dir as `frame0000.jpg … frameNNNN.jpg`
2. Run ffmpeg for GIF:
   ```
   ffmpeg -framerate 24 -i frame%04d.jpg -vf "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" out.gif
   ```
3. Run ffmpeg for MP4 (if requested):
   ```
   ffmpeg -framerate 24 -i frame%04d.jpg -c:v libx264 -pix_fmt yuv420p -movflags faststart out.mp4
   ```
4. Return JSON `{ gif?: string, mp4?: string }` with base64-encoded results (or stream them separately).

Uses `ffmpeg-static` for the ffmpeg binary path and Node's `child_process.execFile`.

---

## Files to modify

### `MemeEditor.tsx` — add two export buttons

Add `handleDownloadGif` and `handleDownloadMp4` (shared logic via a helper):

```ts
async function handleExport(format: 'gif' | 'mp4') {
  setExporting(format)  // show spinner on the right button
  const offscreen = document.createElement('canvas')
  offscreen.width = OUTPUT_WIDTH
  offscreen.height = Math.round(OUTPUT_WIDTH * (img.naturalHeight / img.naturalWidth))
  const ctx = offscreen.getContext('2d')!
  const timeline = buildTimeline(state.lines)
  const frames: string[] = []
  for (let f = 0; f < timeline.frameCount; f++) {
    const t = f / FPS
    const fs = getFrameState(timeline, t, state.lines)
    renderFrame(ctx, imgRef.current!, state.lines, fs)
    frames.push(offscreen.toDataURL('image/jpeg', 0.85).split(',')[1])
  }
  const res = await fetch('/api/meme-animation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ frames, format, filename: `meme-${mkName}` }),
  })
  const { gif, mp4 } = await res.json()
  const data = format === 'gif' ? gif : mp4
  const ext = format
  const a = document.createElement('a')
  a.href = `data:video/${ext};base64,${data}`
  a.download = `meme-${mkName}.${ext}`
  a.click()
  setExporting(null)
}
```

Add `exporting: 'gif' | 'mp4' | null` state and two new buttons in the actions row:

```tsx
<button onClick={() => handleExport('gif')} disabled={!!exporting}>
  {exporting === 'gif' ? <Loader2 className="animate-spin" /> : <Film />}
  GIF
</button>
<button onClick={() => handleExport('mp4')} disabled={!!exporting}>
  {exporting === 'mp4' ? <Loader2 className="animate-spin" /> : <Video />}
  MP4
</button>
```

### `memeCanvas.ts` — add `drawLinePartial` overload

`drawLine` currently checks `if (!line.txt) return`. For the animation we need to pass a
**partial** text string while keeping the line's position/style from the original `MemeLine`.
Simplest fix: accept an optional `txtOverride` parameter:

```ts
export function drawLine(
  ctx: CanvasRenderingContext2D,
  line: MemeLine,
  selected: boolean,
  txtOverride?: string,   // ← add this
): void {
  const txt = txtOverride ?? line.txt
  if (!txt) return
  // … rest unchanged, replace line.txt with txt
}
```

---

## Dependencies to install

```bash
npm install ffmpeg-static       # binary path for the server
npm install --save-dev @types/node  # if not already present
```

No browser-side new deps — frame rendering uses plain Canvas API.

---

## Phased delivery

| Phase | Deliverable |
|---|---|
| 1 | `animationTimeline.ts` + `getFrameState` — unit-testable, no UI |
| 2 | `renderAnimationFrame.ts` + client preview (small canvas in editor, loops via rAF) |
| 3 | `/api/meme-animation` route — GIF first, then add MP4 |
| 4 | "GIF" + "MP4" buttons in MemeEditor with loading states |

---

## Open risks

- **Frame upload size**: 24 fps × ~5 s = 120 frames × ~15 KB JPEG = ~1.8 MB POST body. Acceptable but worth compressing frames harder (quality 0.7) if it grows.
- **ffmpeg availability**: `ffmpeg-static` bundles the binary — works on most Node hosts. Vercel serverless may reject native binaries; if deployed there, switch Phase 3 to use `@ffmpeg/ffmpeg` (WASM) on the client instead and remove the API route.
- **Hebrew fonts in GIF**: ffmpeg doesn't render text — fonts are baked in by the client canvas step, so this is a non-issue.
