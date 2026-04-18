import type { MemeLine } from './encodeMeme';

export interface LineBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function drawMeme(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  lines: MemeLine[],
  selectedIdx: number,
  showSelection: boolean
): void {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);
  lines.forEach((line, idx) => {
    drawLine(ctx, line, showSelection && selectedIdx === idx);
  });
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  line: MemeLine,
  selected: boolean
): void {
  if (!line.txt) return;
  const { width, height } = ctx.canvas;
  const x = line.x * width;
  const y = line.y * height;

  ctx.save();
  ctx.font = `bold ${line.size}px "${line.fontFamily}", Impact, Arial`;
  ctx.textAlign = line.align;
  ctx.textBaseline = 'middle';

  // Outline for readability
  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = Math.max(2, line.size / 10);
  ctx.lineJoin = 'round';
  ctx.strokeText(line.txt, x, y);

  ctx.fillStyle = line.color;
  ctx.fillText(line.txt, x, y);

  if (selected) {
    const bounds = getLineBoundsFromCtx(ctx, line);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(bounds.x - 6, bounds.y - 6, bounds.width + 12, bounds.height + 12);
    ctx.setLineDash([]);
  }

  ctx.restore();
}

function getLineBoundsFromCtx(ctx: CanvasRenderingContext2D, line: MemeLine): LineBounds {
  const { width, height } = ctx.canvas;
  const x = line.x * width;
  const y = line.y * height;
  ctx.font = `bold ${line.size}px "${line.fontFamily}", Impact, Arial`;
  const metrics = ctx.measureText(line.txt);
  const tw = metrics.width;
  const th = line.size * 1.2;
  const bx =
    line.align === 'center' ? x - tw / 2 : line.align === 'right' ? x - tw : x;
  return { x: bx, y: y - th / 2, width: tw, height: th };
}

export function getLineBounds(
  ctx: CanvasRenderingContext2D,
  line: MemeLine
): LineBounds {
  return getLineBoundsFromCtx(ctx, line);
}

export function hitTestLines(
  ctx: CanvasRenderingContext2D,
  lines: MemeLine[],
  clickX: number,
  clickY: number
): number {
  // Test in reverse so top-rendered line wins
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].txt) continue;
    const b = getLineBoundsFromCtx(ctx, lines[i]);
    if (clickX >= b.x - 8 && clickX <= b.x + b.width + 8 && clickY >= b.y - 8 && clickY <= b.y + b.height + 8) {
      return i;
    }
  }
  return -1;
}
