import type { MemeLine } from './encodeMeme';

const HANDLE_DIST_ABOVE = 30; // px above the selection frame top edge

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
  const cx = line.x * width;
  const cy = line.y * height;
  const rad = (line.rotation ?? 0) * (Math.PI / 180);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);

  ctx.font = `bold ${line.size}px "${line.fontFamily}", Impact, Arial`;
  ctx.textAlign = line.align;
  ctx.textBaseline = 'middle';

  ctx.strokeStyle = 'rgba(0,0,0,0.85)';
  ctx.lineWidth = Math.max(2, line.size / 10);
  ctx.lineJoin = 'round';
  ctx.strokeText(line.txt, 0, 0);

  ctx.fillStyle = line.color;
  ctx.fillText(line.txt, 0, 0);

  if (selected) {
    const metrics = ctx.measureText(line.txt);
    const tw = metrics.width;
    const th = line.size * 1.2;
    const bx = line.align === 'center' ? -tw / 2 : line.align === 'right' ? -tw : 0;
    const frameTop = -th / 2 - 6;

    // Dashed selection frame
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(bx - 6, frameTop, tw + 12, th + 12);
    ctx.setLineDash([]);

    // Line from frame top-center to handle
    const handleY = frameTop - HANDLE_DIST_ABOVE;
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, frameTop);
    ctx.lineTo(0, handleY + 8);
    ctx.stroke();

    // Rotation handle circle
    ctx.fillStyle = 'rgba(99,102,241,0.9)';
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, handleY, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// Returns the rotation handle center in canvas (screen) coordinates
export function getRotationHandlePos(
  ctx: CanvasRenderingContext2D,
  line: MemeLine
): { x: number; y: number } | null {
  if (!line.txt) return null;
  const { width, height } = ctx.canvas;
  const cx = line.x * width;
  const cy = line.y * height;
  const rad = (line.rotation ?? 0) * (Math.PI / 180);

  ctx.font = `bold ${line.size}px "${line.fontFamily}", Impact, Arial`;
  const th = line.size * 1.2;
  const localY = -th / 2 - 6 - HANDLE_DIST_ABOVE;

  // Rotate local point (0, localY) into screen space
  return {
    x: cx - localY * Math.sin(rad),
    y: cy + localY * Math.cos(rad),
  };
}

export function hitTestRotationHandle(
  ctx: CanvasRenderingContext2D,
  line: MemeLine,
  clickX: number,
  clickY: number
): boolean {
  const pos = getRotationHandlePos(ctx, line);
  if (!pos) return false;
  const dx = clickX - pos.x;
  const dy = clickY - pos.y;
  return dx * dx + dy * dy <= 14 * 14;
}

export function hitTestLines(
  ctx: CanvasRenderingContext2D,
  lines: MemeLine[],
  clickX: number,
  clickY: number
): number {
  for (let i = lines.length - 1; i >= 0; i--) {
    if (!lines[i].txt) continue;
    const line = lines[i];
    const { width, height } = ctx.canvas;
    const cx = line.x * width;
    const cy = line.y * height;
    const rad = (line.rotation ?? 0) * (Math.PI / 180);

    // Transform click into line's local (unrotated) space
    const dx = clickX - cx;
    const dy = clickY - cy;
    const ldx = dx * Math.cos(rad) + dy * Math.sin(rad);
    const ldy = -dx * Math.sin(rad) + dy * Math.cos(rad);

    ctx.font = `bold ${line.size}px "${line.fontFamily}", Impact, Arial`;
    const metrics = ctx.measureText(line.txt);
    const tw = metrics.width;
    const th = line.size * 1.2;
    const lbx = line.align === 'center' ? -tw / 2 : line.align === 'right' ? -tw : 0;

    if (ldx >= lbx - 8 && ldx <= lbx + tw + 8 && ldy >= -th / 2 - 8 && ldy <= th / 2 + 8) {
      return i;
    }
  }
  return -1;
}
