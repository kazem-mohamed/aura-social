export type StickerName = "heart" | "bubble" | "bookmark" | "bell" | "share" | "sparkle" | "check" | "cross" | "bang" | "info";

export interface StickerArt {
  /** Filled silhouette parts, drawn with the sticker fill and black outline. */
  body: string[];
  /** Marks drawn on top (a tick, a cross); `fill` marks are dots. */
  marks?: { d: string; fill?: boolean }[];
}

const CIRCLE = "M10 50a40 40 0 1 0 80 0a40 40 0 1 0 -80 0Z";

/** 100 × 100 artboards — the flat counterparts of the inflated 3D objects. */
export const STICKER_PATHS: Record<StickerName, StickerArt> = {
  heart: {
    body: ["M50 86 C22 66 8 52 8 34 C8 20 19 10 32 10 C40 10 46 14 50 21 C54 14 60 10 68 10 C81 10 92 20 92 34 C92 52 78 66 50 86 Z"],
  },
  bubble: {
    body: ["M31 78.9 A38 38 0 1 0 17.1 65 Q14 82 8 94 Q22 88 31 78.9 Z"],
  },
  bookmark: {
    body: ["M28 8 H72 Q80 8 80 16 V88 Q80 94 75 91 L50 74 L25 91 Q20 94 20 88 V16 Q20 8 28 8 Z"],
  },
  bell: {
    body: [
      "M41 78 A9 9 0 0 0 59 78 Z",
      "M45 11a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z",
      "M50 14 C34 14 25 27 25 43 V58 Q25 63 21 67 L15 73 Q12 78 18 78 H82 Q88 78 85 73 L79 67 Q75 63 75 58 V43 C75 27 66 14 50 14 Z",
    ],
  },
  share: {
    body: [
      "M24.02 65 A30 30 0 1 1 75.98 65 L81.61 68.25 L63.35 73.87 L59.09 55.25 L64.72 58.5 A17 17 0 1 0 35.28 58.5 A6.5 6.5 0 0 1 24.02 65 Z",
    ],
  },
  sparkle: {
    body: ["M50 6 C53 36 64 47 94 50 C64 53 53 64 50 94 C47 64 36 53 6 50 C36 47 47 36 50 6 Z"],
  },
  check: { body: [CIRCLE], marks: [{ d: "M32 51 L45 64 L69 38" }] },
  cross: { body: [CIRCLE], marks: [{ d: "M36 36 L64 64 M64 36 L36 64" }] },
  bang: { body: [CIRCLE], marks: [{ d: "M50 30 V54" }, { d: "M45 68a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z", fill: true }] },
  info: { body: [CIRCLE], marks: [{ d: "M50 46 V70" }, { d: "M45 32a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z", fill: true }] },
};
