import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";
import { formatCount } from "./format";

const ROLL = {
  enter: (direction: number) => ({ y: `${direction * 100}%`, opacity: 0 }),
  center: { y: "0%", opacity: 1 },
  exit: (direction: number) => ({ y: `${direction * -100}%`, opacity: 0 }),
};

/** A count whose digits roll up when it rises and down when it falls. Tabular, so nothing jitters. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const { reduced } = useMotionPrefs();
  const [previous, setPrevious] = useState(value);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (value !== previous) {
    setDirection(value > previous ? 1 : -1);
    setPrevious(value);
  }

  const text = formatCount(value);
  if (reduced) return <span className={cx("tnum", className)}>{text}</span>;

  return (
    <span className={cx("relative inline-grid overflow-hidden tnum", className)}>
      {/* While they roll, the old digits and the new are both in the page; assistive tech reads one value. */}
      <span className="sr-only">{text}</span>
      <AnimatePresence initial={false} custom={direction}>
        <motion.span
          aria-hidden
          key={value}
          custom={direction}
          variants={ROLL}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
