import type { StickerShape } from "./shapes";

export const STICKER_COLORS = [
  { name: "Electric Blue", key: "blue", hex: "#4da2ff" },
  { name: "Mint Pop", key: "mint", hex: "#55db9c" },
  { name: "Lavender", key: "lavender", hex: "#e9ccff" },
  { name: "Ember", key: "ember", hex: "#fb4903" },
  { name: "Sunburst", key: "sun", hex: "#ffd731" },
  { name: "Voltage Violet", key: "violet", hex: "#5c4ade" },
] as const;

export type StickerColor = (typeof STICKER_COLORS)[number];

export const IDENTITY_SHAPES = [
  "circle",
  "squircle",
  "flower",
  "burst",
  "clover",
  "scallop",
  "blob",
] as const satisfies readonly StickerShape[];

export type IdentityShape = (typeof IDENTITY_SHAPES)[number];

export interface Identity {
  hash: number;
  color: StickerColor;
  shape: IdentityShape;
  /** Degrees, −8…+8. */
  tilt: number;
  /** Only used by the blob shape. */
  seed: number;
}

/** FNV-1a, 32-bit. */
export function hash32(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const cache = new Map<string, Identity>();

/**
 * Every handle (or id, when no handle exists) resolves to one sticker:
 * a colour, a shape and a tilt. Nobody chooses it, and it costs zero
 * backend storage — spec §5.2.
 */
export function identityFor(key: string): Identity {
  const normalised = key.toLowerCase().trim() || "anon";
  const hit = cache.get(normalised);
  if (hit) return hit;

  const h = hash32(normalised);
  const identity: Identity = {
    hash: h,
    color: STICKER_COLORS[h % STICKER_COLORS.length],
    shape: IDENTITY_SHAPES[(h >>> 3) % IDENTITY_SHAPES.length],
    tilt: ((h >>> 9) % 17) - 8,
    seed: ((h >>> 13) % 628) / 100,
  };
  cache.set(normalised, identity);
  return identity;
}

/** Up to two initials from a display name or a handle. */
export function initialsFor(name: string): string {
  const parts = name
    .replace(/^@/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) || "?").toUpperCase();
}
