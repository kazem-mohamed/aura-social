import { motion } from "framer-motion";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

type Mark = { sticker: StickerName } | { glyph: GlyphName };

interface Feature {
  title: string;
  line: string;
  mark: Mark;
  fill: string;
  ink?: string;
  tilt: number;
}

/** Only what works today. Each one is a sticker slapped on the wall. */
const FEATURES: Feature[] = [
  { title: "Four rooms", line: "Everyone, Following, Yours and Saved.", mark: { glyph: "wall" }, fill: "var(--sky)", tilt: -3 },
  { title: "Words or a picture", line: "Post text, one image, or both.", mark: { glyph: "image" }, fill: "var(--sun)", tilt: 4 },
  { title: "Likes that inflate", line: "Tap the heart and it swells.", mark: { sticker: "heart" }, fill: "var(--ember)", tilt: -5 },
  { title: "Comments and replies", line: "Threads that stay readable.", mark: { sticker: "bubble" }, fill: "var(--blue)", tilt: 2 },
  { title: "Share with a line", line: "Pass a post on, with your caption on top.", mark: { sticker: "share" }, fill: "var(--violet)", ink: "var(--paper)", tilt: -2 },
  { title: "Save for later", line: "Keep a post to read again.", mark: { sticker: "bookmark" }, fill: "var(--mint)", tilt: 5 },
  { title: "Follow people", line: "Their posts land on your wall.", mark: { glyph: "people" }, fill: "var(--lavender)", tilt: -4 },
  { title: "Alerts in one list", line: "Likes, comments, shares and follows.", mark: { sticker: "bell" }, fill: "var(--sun)", tilt: 3 },
  { title: "Your photo, framed", line: "Crop it right in the app.", mark: { glyph: "camera" }, fill: "var(--concrete)", tilt: -2 },
  { title: "Night paper", line: "A dark theme, designed — not inverted.", mark: { glyph: "moon" }, fill: "var(--night)", ink: "var(--bone)", tilt: 4 },
];

/** The wall: every real feature as a bumper sticker, arriving as it scrolls into view. */
export function FeatureWall() {
  const { reduced } = useMotionPrefs();

  return (
    <section id="wall" aria-labelledby="wall-title" className="scroll-mt-24 bg-ground">
      <div className="mx-auto grid max-w-(--page-max) justify-items-center gap-12 px-4 py-20 sm:px-8 sm:py-28">
        <div className="grid justify-items-center gap-5 text-center">
          <h2 id="wall-title" className="type-display text-balance">
            What’s on the wall
          </h2>
          <p className="max-w-[44ch] type-body-lg text-ink-2">All of it works today. No roadmap, no promises — just the wall.</p>
        </div>
        <ul className="flex max-w-[1100px] flex-wrap justify-center gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-7">
          {FEATURES.map((feature, index) => (
            <motion.li
              key={feature.title}
              initial={reduced ? false : { opacity: 0, y: -18, rotate: feature.tilt * 1.8, scale: 1.06 }}
              whileInView={{ opacity: 1, y: 0, rotate: feature.tilt, scale: 1 }}
              whileHover={reduced ? undefined : { y: -4, rotate: feature.tilt - 2 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ ...spring.arrive, delay: (index % 5) * 0.07 }}
              style={reduced ? { rotate: feature.tilt } : undefined}
            >
              <div
                className="flex max-w-[min(22rem,calc(100vw-56px))] items-center gap-4 rounded-pill border border-line py-3 pr-6 pl-3"
                style={{ background: feature.fill, color: feature.ink ?? "var(--carbon)" }}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-carbon bg-paper text-carbon">
                  {"sticker" in feature.mark ? (
                    <Sticker name={feature.mark.sticker} fill={feature.fill} size={30} />
                  ) : (
                    <Glyph name={feature.mark.glyph} size={24} />
                  )}
                </span>
                <span className="grid gap-0.5">
                  <span className="text-[17px] leading-tight font-bold">{feature.title}</span>
                  <span className="type-caption">{feature.line}</span>
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
