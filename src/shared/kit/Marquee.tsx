import type { CSSProperties } from "react";
import { cx } from "./cx";

interface MarqueeProps {
  items: string[];
  /** Seconds per loop. */
  duration?: number;
  className?: string;
}

/**
 * The ink ticker band. Screen readers get the sentences once; the moving
 * copy is hidden from them. Pauses on hover and stops under reduced motion.
 */
export function Marquee({ items, duration = 40, className }: MarqueeProps) {
  const track = (
    <span className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-7 pr-7">
          {item}
          <span aria-hidden>✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={cx("kit-marquee overflow-hidden whitespace-nowrap bg-action py-3 type-label text-action-ink", className)}>
      <span className="sr-only">{items.join(". ")}</span>
      <div aria-hidden className="kit-marquee-track flex w-max" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
        {track}
        {track}
      </div>
    </div>
  );
}
