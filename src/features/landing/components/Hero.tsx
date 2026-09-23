import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import type { ObjectName } from "@/assets/objects/manifest";
import { Logo } from "@/shared/brand/Logo";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { cx } from "@/shared/kit/cx";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { usePosterLines } from "../usePosterLines";
import { Breathe } from "./Breathe";

interface Slapped {
  name: ObjectName;
  /** Resting tilt in degrees. */
  tilt: number;
  /** How strongly scrolling inflates and lifts it. */
  depth: number;
  className: string;
  sizes: string;
}

/** Where each object lands on the wall, in the order it arrives. The bubble is the LCP image. */
const OBJECTS: Slapped[] = [
  { name: "bubble", tilt: -6, depth: 1, className: "left-[30%] top-[4%] w-[44%] lg:left-[38%] lg:top-0 lg:w-[26%]", sizes: "(min-width: 1024px) 26vw, 44vw" },
  { name: "heart", tilt: 9, depth: 0.7, className: "left-0 top-[30%] w-[30%] lg:left-[4%] lg:top-[18%] lg:w-[17%]", sizes: "(min-width: 1024px) 17vw, 30vw" },
  { name: "bookmark", tilt: -11, depth: 0.85, className: "right-0 top-[38%] w-[22%] lg:right-[16%] lg:top-[22%] lg:w-[12%]", sizes: "(min-width: 1024px) 12vw, 22vw" },
  { name: "share", tilt: 7, depth: 0.6, className: "left-[74%] top-0 w-[20%] lg:left-[66%] lg:top-[44%] lg:w-[14%]", sizes: "(min-width: 1024px) 14vw, 20vw" },
  { name: "bell", tilt: -5, depth: 0.9, className: "hidden lg:block lg:right-0 lg:top-0 lg:w-[13%]", sizes: "13vw" },
];

const LINES = [
  { text: "Everything here", className: "" },
  { text: "breathes", className: "sm:[font-stretch:124%]" },
];

function SlappedObject({ object, index, progress }: { object: Slapped; index: number; progress: MotionValue<number> }) {
  const { reduced } = useMotionPrefs();
  const y = useTransform(progress, [0, 1], [0, -140 * object.depth]);
  const scale = useTransform(progress, [0, 1], [1, 1 + 0.3 * object.depth]);
  const isAnchor = index === 0;

  return (
    <motion.div aria-hidden className={cx("absolute", object.className)} style={reduced ? undefined : { y, scale }}>
      <motion.div
        // The anchor never starts invisible: it is the largest paint on the page.
        initial={reduced ? false : { scale: 1.35, rotate: object.tilt - 14, opacity: isAnchor ? 1 : 0 }}
        animate={{ scale: 1, rotate: object.tilt, opacity: 1 }}
        transition={{ ...spring.release, delay: 0.15 + index * 0.12 }}
      >
        <Breathe delay={index * 0.6}>
          <ObjectArt name={object.name} sizes={object.sizes} priority={isAnchor} />
        </Breathe>
      </motion.div>
    </motion.div>
  );
}

/**
 * The slap: an empty sky wall, then the objects and the logo slap onto it one
 * after another above a two-line poster. Scrolling away inflates them.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = usePosterLines<HTMLHeadingElement>();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  return (
    <section ref={heroRef} aria-labelledby="hero-title" className="relative overflow-hidden bg-band-sky">
      <div className="mx-auto grid max-w-(--page-max) grid-cols-[minmax(0,1fr)] px-4 pt-20 pb-12 sm:px-8 sm:pt-24 sm:pb-16">
        <div className="relative h-[190px] sm:h-[260px] lg:h-[300px]">
          {OBJECTS.map((object, index) => (
            <SlappedObject key={object.name} object={object} index={index} progress={scrollYProgress} />
          ))}
          <div className="absolute -bottom-[6%] left-[4%] z-10 w-[42%] sm:w-[30%] lg:-bottom-[8%] lg:left-[18%] lg:w-[20%]">
            <Logo slapIn title={null} className="h-auto w-full" />
          </div>
        </div>

        <h1
          id="hero-title"
          ref={titleRef}
          className="relative z-[5] grid grid-cols-[minmax(0,1fr)] font-display leading-[0.8] font-black tracking-[-0.01em] uppercase"
        >
          {LINES.map((line, index) => (
            <motion.span
              key={line.text}
              data-line
              className={cx("block w-max origin-bottom-left", line.className)}
              initial={{ scaleY: 0.7 }}
              animate={{ scaleY: 1 }}
              transition={{ ...spring.release, delay: 0.05 + index * 0.1 }}
            >
              {line.text}
            </motion.span>
          ))}
        </h1>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 sm:mt-10">
          <p className="max-w-[44ch] type-body-lg">
            Aura is a social wall where every like inflates, every save sticks and every follow peels.{" "}
            <span className="font-bold">Your sticker is already waiting.</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to={routes.register} viewTransition variant="sticker" fill="sun" size="lg" iconEnd="arrow-right">
              Join Aura
            </ButtonLink>
            <ButtonLink to={routes.login} viewTransition variant="secondary" size="lg">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
