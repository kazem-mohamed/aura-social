export interface FoldGeometry {
  /** Keeps everything except the lifted corner. */
  clip: string;
  /** The folded-over flap: the mirror image of the lifted corner. */
  flap: string;
}

const f = (value: number): string => value.toFixed(2);

/**
 * Peel geometry for a rounded rectangle whose top-right corner is lifted.
 *
 * The rectangle's top-right corner sits at (width, 0). The fold runs from
 * (width − depth, 0) to (width, depth) with a slight curl; the flap is the
 * exact reflection of the removed rounded corner across the fold, so the
 * paper reads as folded flat rather than drawn on. `depth` is clamped to
 * stay just outside the corner radius.
 */
export function foldGeometry(width: number, radius: number, depth: number, curl = 0.09): FoldGeometry {
  const p = Math.max(depth, radius + 1);
  const ax = width - p;
  const ay = 0;
  const bx = width;
  const by = p;
  const k = (p * curl) / Math.SQRT2;
  const qx = (ax + bx) / 2 + k;
  const qy = (ay + by) / 2 - k;
  const r1x = width - p;
  const r1y = p - radius;
  const r2x = width - p + radius;
  const r2y = p;

  return {
    clip: `M-4000 -4000L${f(ax)} -4000L${f(ax)} ${f(ay)}Q${f(qx)} ${f(qy)} ${f(bx)} ${f(by)}L8000 ${f(by)}L8000 8000L-4000 8000Z`,
    flap: `M${f(ax)} ${f(ay)}L${f(r1x)} ${f(r1y)}A${radius} ${radius} 0 0 0 ${f(r2x)} ${f(r2y)}L${f(bx)} ${f(by)}Q${f(qx)} ${f(qy)} ${f(ax)} ${f(ay)}Z`,
  };
}

/**
 * Static peel for a round sticker: the segment beyond a chord at `inset`
 * from the centre, towards the bottom-right, is folded back.
 */
export function roundFold(cx: number, cy: number, r: number, inset: number): FoldGeometry {
  const k = cx + cy + inset * Math.SQRT2;
  const a = Math.acos(inset / r);
  const p1x = cx + r * Math.cos(Math.PI / 4 - a);
  const p1y = cy + r * Math.sin(Math.PI / 4 - a);
  const p2x = cx + r * Math.cos(Math.PI / 4 + a);
  const p2y = cy + r * Math.sin(Math.PI / 4 + a);

  return {
    clip: `M-400 -400L${f(k + 400)} -400L-400 ${f(k + 400)}Z`,
    flap: `M${f(p1x)} ${f(p1y)}A${r} ${r} 0 0 0 ${f(p2x)} ${f(p2y)}Z`,
  };
}
