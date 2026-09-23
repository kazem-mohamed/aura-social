import type { ObjectName } from "@/assets/objects/manifest";
import type { StickerName } from "./stickerPaths";

/** The flat sticker drawn when an object image cannot load — no broken images, no layout shift. */
export const OBJECT_FALLBACKS: Record<ObjectName, { sticker: StickerName; fill: string }> = {
  bubble: { sticker: "bubble", fill: "var(--blue)" },
  heart: { sticker: "heart", fill: "var(--ember)" },
  bookmark: { sticker: "bookmark", fill: "var(--sun)" },
  share: { sticker: "share", fill: "var(--violet)" },
  bell: { sticker: "bell", fill: "var(--mint)" },
  "bubble-deflated": { sticker: "bubble", fill: "var(--band-mist)" },
  "bell-deflated": { sticker: "bell", fill: "var(--band-mist)" },
  "bookmark-deflated": { sticker: "bookmark", fill: "var(--band-mist)" },
  "bubble-popped": { sticker: "bubble", fill: "var(--lavender)" },
};
