export type StickerShape = "circle" | "squircle" | "flower" | "burst" | "clover" | "scallop" | "blob" | "heart";

const cache = new Map<string, string>();

function radialProfile(shape: StickerShape, t: number, seed: number): number {
  switch (shape) {
    case "burst":
      return 0.86 + 0.14 * Math.cos(8 * t);
    case "flower":
      return 0.84 + 0.16 * Math.cos(6 * t);
    case "clover":
      return 0.78 + 0.22 * Math.cos(4 * t);
    case "scallop":
      return 0.93 + 0.07 * Math.cos(14 * t);
    case "blob":
      return 0.86 + 0.08 * Math.cos(3 * t + seed) + 0.06 * Math.cos(5 * t + seed * 1.7);
    default:
      return 1;
  }
}

/**
 * Closed SVG path of a sticker silhouette centred on (0, 0) whose outer
 * radius is `radius`. `seed` only affects the blob. Results are cached.
 */
export function shapePath(shape: StickerShape, radius: number, seed = 0, steps = 144): string {
  const key = `${shape}:${radius}:${seed}:${steps}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let d = "";
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    let x: number;
    let y: number;

    if (shape === "squircle") {
      const c = Math.cos(t);
      const s = Math.sin(t);
      x = radius * 0.95 * Math.sign(c) * Math.sqrt(Math.abs(c));
      y = radius * 0.95 * Math.sign(s) * Math.sqrt(Math.abs(s));
    } else if (shape === "heart") {
      const s = Math.sin(t);
      x = (radius * 16 * s * s * s) / 17;
      y = (-radius * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) / 17 - radius * 0.13;
    } else {
      const r = radius * radialProfile(shape, t, seed);
      x = r * Math.cos(t);
      y = r * Math.sin(t);
    }

    d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  const path = `${d}Z`;
  cache.set(key, path);
  return path;
}
