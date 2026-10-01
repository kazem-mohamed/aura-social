import { motion, transform, useScroll, useTransform, type MotionStyle, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router";
import type { ObjectName } from "@/assets/objects/manifest";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { cx } from "@/shared/kit/cx";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { DEFLATED } from "../breath";
import { usePosterLines } from "../usePosterLines";
import { Breathe } from "./Breathe";

/** How full of breath an object is over the band's arrival. */
const fill = transform([0.45, 0.8], [0, 1]);

interface InflatingProps {
  /** The deflated render it starts as. */
  flat: ObjectName;
  /** The inflated render it becomes. */
  full: ObjectName;
  progress: MotionValue<number>;
  tilt: number;
  delay?: number;
  sizes: string;
  className: string;
}

/**
 * The brand's idea, played once: an object lies deflated, and as the band
 * arrives it fills with breath — the flat render gives way to the full one.
 * Under reduced motion it is simply inflated.
 */
function Inflating({ flat, full, progress, tilt, delay = 0, sizes, className }: InflatingProps) {
  const { reduced } = useMotionPrefs();
  const scale = useTransform(progress, [0, 1], [0.8, 1]);
  // Function transforms stay on the JS path: framer 12.34 hands a range-mapped
  // opacity to a native scroll timeline that follows the page, not this band.
  const fullOpacity = useTransform(progress, fill);
  const flatOpacity = useTransform(progress, (p) => 1 - fill(p));

  return (
    <motion.div aria-hidden className={cx("absolute", className)} style={reduced ? { rotate: tilt } : { scale, rotate: tilt }}>
      <Breathe delay={delay}>
        <div className="grid">
          {reduced ? null : (
            // The deflated render sits low, like a balloon on the floor.
            <motion.div className="col-start-1 row-start-1 self-end" style={{ opacity: flatOpacity }}>
              <ObjectArt name={flat} sizes={sizes} />
            </motion.div>
          )}
          <motion.div className="col-start-1 row-start-1" style={reduced ? undefined : { opacity: fullOpacity }}>
            <ObjectArt name={full} sizes={sizes} />
          </motion.div>
        </div>
      </Breathe>
    </motion.div>
  );
}

/** The close: a Sunburst band, a two-line poster, and the way in. Its objects and its type fill with breath as it arrives. */
export function JoinBand() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const titleRef = usePosterLines<HTMLHeadingElement>(0.22);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  // The poster takes the same breath as the balloons: narrow while they lie flat, full once they're filled.
  const inflate = useTransform(scrollYProgress, (p) => DEFLATED + (1 - DEFLATED) * fill(p));

  return (
    <section ref={ref} aria-labelledby="join-title" className="relative overflow-hidden bg-sun text-carbon">
      <Inflating
        flat="bookmark-deflated"
        full="bookmark"
        progress={scrollYProgress}
        tilt={-12}
        sizes="240px"
        className="-top-6 -left-6 w-[26%] max-w-[240px] sm:w-[18%]"
      />
      <Inflating
        flat="bubble-deflated"
        full="bubble"
        progress={scrollYProgress}
        tilt={10}
        delay={1.2}
        sizes="340px"
        className="-right-8 -bottom-10 w-[38%] max-w-[340px] sm:w-[26%]"
      />

      <div className="relative mx-auto grid max-w-(--page-max) grid-cols-[minmax(0,1fr)] justify-items-center gap-8 px-4 py-28 text-center sm:px-8 sm:py-36">
        <motion.h2
          id="join-title"
          ref={titleRef}
          style={reduced ? undefined : ({ "--inflate": inflate } as MotionStyle)}
          className="grid w-full grid-cols-[minmax(0,1fr)] justify-items-center font-display leading-[0.8] font-black tracking-[-0.01em] uppercase [--rest-stretch:124%]"
        >
          {/* Two lines, each fitted: one line of it was too small to close on a phone. */}
          <span data-line className="stretch-breath block w-max">
            Stick
          </span>
          <span data-line className="stretch-breath block w-max">
            around
          </span>
        </motion.h2>
        <p className="max-w-[40ch] type-body-lg">Pick a username, get your sticker, and put something on the wall.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <ButtonLink to={routes.register} viewTransition variant="sticker" fill="violet" size="lg" iconEnd="arrow-right">
            Join Aura
          </ButtonLink>
          <Link to={routes.login} viewTransition className="type-label underline decoration-1 underline-offset-4">
            I already have a sticker
          </Link>
        </div>
      </div>
    </section>
  );
}
