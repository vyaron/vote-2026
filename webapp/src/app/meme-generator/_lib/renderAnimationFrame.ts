import type { MemeLine } from './encodeMeme';
import type { FrameState } from './animationTimeline';
import { drawLine } from './memeCanvas';

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lines: MemeLine[],
  state: FrameState,
): void {
  const { width, height } = ctx.canvas;

  ctx.clearRect(0, 0, width, height);

  // Ken Burns: slow zoom from center
  ctx.save();
  const s = state.kenBurnsScale;
  ctx.translate(width / 2, height / 2);
  ctx.scale(s, s);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();

  // Text with fade-out — pass partial text via spread; drawLine skips empty strings
  ctx.save();
  ctx.globalAlpha = state.globalAlpha;
  lines.forEach((line, idx) => {
    drawLine(ctx, { ...line, txt: state.lineTexts[idx] ?? '' }, false);
  });
  ctx.restore();
}
