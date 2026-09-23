import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { usePosterLines } from "../usePosterLines";
import { Breathe } from "./Breathe";

/** The close: a Sunburst band, one line of poster, and the way in. The objects inflate as it arrives. */
export function JoinBand() {
  const ref = useRef<HTMLElement>(null);
  const titleRef = usePosterLines<HTMLHeadingElement>(0.22);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const inflate = useTransform(scrollYProgress, [0, 1], [0.7, 1]);

  return (
    <section ref={ref} aria-labelledby="join-title" className="relative overflow-hidden bg-sun text-carbon">
      <motion.div
        aria-hidden
        className="absolute -top-8 -left-10 w-[34%] max-w-[300px] sm:w-[24%]"
        style={reduced ? { rotate: -12 } : { scale: inflate, rotate: -12 }}
      >
        <Breathe>
          <ObjectArt name="heart" sizes="300px" />
        </Breathe>
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute -right-8 -bottom-10 w-[38%] max-w-[340px] sm:w-[26%]"
        style={reduced ? { rotate: 10 } : { scale: inflate, rotate: 10 }}
      >
        <Breathe delay={1.2}>
          <ObjectArt name="bubble" sizes="340px" />
        </Breathe>
      </motion.div>

      <div className="relative mx-auto grid max-w-(--page-max) grid-cols-[minmax(0,1fr)] justify-items-center gap-8 px-4 py-28 text-center sm:px-8 sm:py-36">
        <h2
          id="join-title"
          ref={titleRef}
          className="grid w-full grid-cols-[minmax(0,1fr)] justify-items-center font-display leading-[0.8] font-black tracking-[-0.01em] uppercase [font-stretch:124%]"
        >
          {/* Two lines, each fitted: one line of it was too small to close on a phone. */}
          <span data-line className="block w-max">
            Stick
          </span>
          <span data-line className="block w-max">
            around
          </span>
        </h2>
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
