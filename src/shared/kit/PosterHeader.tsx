import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";
import { useFitText } from "./useFitText";

interface PosterHeaderProps {
  /** The page's name in crushed display type — it is the page's `<h1>`. */
  title: string;
  eyebrow?: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** `xl` is for a person's name on their profile. */
  size?: "poster" | "xl";
  children?: ReactNode;
  className?: string;
}

/**
 * Every member page opens like a poster: its name, huge and crushed, pressed
 * onto the page with a small squash as it lands. One line, always — it
 * shrinks to fit rather than wrap.
 */
export function PosterHeader({ title, eyebrow, lede, actions, size = "poster", children, className }: PosterHeaderProps) {
  const titleRef = useFitText<HTMLHeadingElement>(title);

  return (
    <header className={cx("grid grid-cols-[minmax(0,1fr)] gap-5 pt-8 pb-8 sm:pt-12 sm:pb-10", className)}>
      {eyebrow ? <div className="type-label text-ink-2">{eyebrow}</div> : null}
      <motion.h1
        ref={titleRef}
        className={cx(size === "xl" ? "type-display-xl" : "type-poster", "min-w-0 whitespace-nowrap")}
        style={{ transformOrigin: "0% 100%" }}
        initial={{ scaleY: 0.82, scaleX: 1.04 }}
        animate={{ scaleY: 1, scaleX: 1 }}
        transition={spring.release}
      >
        {title}
      </motion.h1>
      {lede || actions ? (
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          {lede ? <div className="max-w-[56ch] type-body-lg text-ink-2">{lede}</div> : <span />}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </header>
  );
}
