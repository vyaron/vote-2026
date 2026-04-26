import type { MemeLine } from './encodeMeme';

const CHAR_DURATION = 0.07; // seconds per character
const MAX_LINE_DUR = 2.5;   // cap so very long lines don't drag
const PAUSE = 0.7;          // seconds between lines
const HOLD = 1.5;           // seconds to hold finished meme
const FADE_DUR = 0.5;       // seconds for fade-out before loop

export const FPS = 24;
export const OUTPUT_WIDTH = 400; // px, WhatsApp-friendly

export interface LineSlot {
  lineIdx: number;
  start: number; // seconds
  end: number;   // seconds — typewriter fully shown
}

export interface AnimTimeline {
  slots: LineSlot[];
  holdStart: number;
  fadeStart: number;
  totalDuration: number;
  frameCount: number;
}

export function buildTimeline(lines: MemeLine[]): AnimTimeline {
  const slots: LineSlot[] = [];
  let cursor = 0;

  lines.forEach((line, idx) => {
    if (!line.txt.trim()) return;
    const dur = Math.min(line.txt.length * CHAR_DURATION, MAX_LINE_DUR);
    slots.push({ lineIdx: idx, start: cursor, end: cursor + dur });
    cursor += dur + PAUSE;
  });

  const holdStart = slots.length > 0 ? slots[slots.length - 1].end : 0;
  const fadeStart = holdStart + HOLD;
  const totalDuration = fadeStart + FADE_DUR;

  return {
    slots,
    holdStart,
    fadeStart,
    totalDuration,
    frameCount: Math.ceil(totalDuration * FPS),
  };
}

export interface FrameState {
  kenBurnsScale: number; // 1.0 → 1.05
  lineTexts: string[];   // partial text per line index
  globalAlpha: number;   // 1.0 normally; ramps to 0 during fade-out
}

export function getFrameState(timeline: AnimTimeline, t: number, lines: MemeLine[]): FrameState {
  const kenBurnsScale = 1 + 0.05 * Math.min(1, t / timeline.totalDuration);

  const lineTexts = lines.map((line, idx) => {
    if (!line.txt.trim()) return '';
    const slot = timeline.slots.find(s => s.lineIdx === idx);
    if (!slot) return '';
    if (t < slot.start) return '';
    if (t >= slot.end) return line.txt;
    const progress = (t - slot.start) / (slot.end - slot.start);
    return line.txt.slice(0, Math.floor(progress * line.txt.length));
  });

  const globalAlpha =
    t < timeline.fadeStart
      ? 1
      : Math.max(0, 1 - (t - timeline.fadeStart) / FADE_DUR);

  return { kenBurnsScale, lineTexts, globalAlpha };
}
