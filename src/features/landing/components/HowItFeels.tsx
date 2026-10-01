import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import type { ObjectName } from "@/assets/objects/manifest";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { cx } from "@/shared/kit/cx";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { Breathe } from "./Breathe";
import { SamplePost } from "./SamplePost";

interface Step {
  key: string;
  chip: string;
  verb: string;
  result: string;
  object: ObjectName;
}

const STEPS: Step[] = [
  { key: "like", chip: "Like", verb: "Like it.", result: "It inflates.", object: "heart" },
  { key: "comment", chip: "Comment", verb: "Say something.", result: "It gets volume.", object: "bubble" },
  { key: "save", chip: "Save", verb: "Save it.", result: "It sticks.", object: "bookmark" },
  { key: "share", chip: "Share", verb: "Share it.", result: "It goes round.", object: "share" },
];

const LAST = STEPS.length - 1;

/** Scroll progress through the pinned section → which step has happened (−1 = nothing yet). */
function stepAt(progress: number): number {
  return Math.min(LAST, Math.max(-1, Math.floor(progress * (STEPS.length + 0.4) - 0.2)));
}

/**
 * The pinned demo: one sample post, and scrolling does to it what a person
 * would — like, comment, save, share — each answered by its own object.
 * Under reduced motion it is not pinned and shows the finished state.
 */
export function HowItFeels() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(-1);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = stepAt(value);
    setStep((current) => (current === next ? current : next));
  });

  const shown = reduced ? LAST : step;
  const current = shown >= 0 ? STEPS[shown] : null;

  return (
    <section id="feel" ref={ref} aria-labelledby="feel-title" className={cx("relative scroll-mt-24 bg-ground", !reduced && "h-[360vh]")}>
      <div
        className={cx(
          "mx-auto grid max-w-(--page-max) content-center gap-8 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16",
          reduced ? "py-24" : "sticky top-0 h-dvh pt-24 pb-8",
        )}
      >
        <div className="grid content-start gap-5 lg:gap-10">
          <h2 id="feel-title" className="type-display text-balance">
            How it feels
          </h2>
          <ol className="flex flex-wrap gap-2 lg:grid lg:gap-5">
            {STEPS.map((item, index) => (
              <li
                key={item.key}
                aria-current={index === shown ? "step" : undefined}
                className={cx(
                  "rounded-pill border border-line px-3.5 py-1.5 type-label transition-colors duration-300",
                  "lg:rounded-none lg:border-0 lg:p-0 lg:tracking-normal lg:normal-case",
                  index === shown ? "bg-action text-action-ink lg:bg-transparent lg:text-ink" : "text-ink-2 lg:text-ink-3",
                )}
              >
                <span className="lg:hidden">{item.chip}</span>
                <span className="hidden lg:grid lg:gap-1">
                  <span className="type-heading">{item.verb}</span>
                  <span className="type-body-lg">{item.result}</span>
                </span>
              </li>
            ))}
          </ol>
          <p aria-hidden className="type-heading-sm lg:hidden">
            {current ? `${current.verb} ${current.result}` : "Scroll, and watch it react."}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div aria-hidden className="absolute -top-12 -right-3 z-10 w-[34%] sm:-right-10 lg:-top-28 lg:-right-20 lg:w-[44%]">
            <AnimatePresence mode="popLayout" initial={false}>
              {current ? (
                <motion.div
                  key={current.key}
                  initial={{ scale: 0.4, rotate: -24, opacity: 0 }}
                  animate={{ scale: 1, rotate: -6, opacity: 1 }}
                  exit={{ scale: 0.6, rotate: 14, opacity: 0, transition: { duration: 0.2 } }}
                  transition={spring.release}
                >
                  <Breathe>
                    <ObjectArt name={current.object} sizes="(min-width: 1024px) 240px, 34vw" />
                  </Breathe>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <SamplePost liked={shown >= 0} commented={shown >= 1} saved={shown >= 2} shared={shown >= 3} />
        </div>
      </div>
    </section>
  );
}
