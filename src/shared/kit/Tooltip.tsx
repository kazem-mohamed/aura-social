import { AnimatePresence, motion } from "framer-motion";
import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";
import { useSafeId } from "@/shared/lib/useSafeId";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";

interface TooltipProps {
  label: string;
  side?: "top" | "bottom";
  children: ReactElement<{ "aria-describedby"?: string }>;
}

/**
 * A Sunburst label sticker. Hover shows it after 400ms, keyboard focus
 * shows it at once, Escape hides it. The description is always available to
 * screen readers through a hidden element, not only while visible.
 */
export function Tooltip({ label, side = "top", children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const id = useSafeId("tooltip");

  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => show(400)}
      onPointerLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
    >
      {cloneElement(children, { "aria-describedby": id })}
      <span id={id} className="sr-only">
        {label}
      </span>
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute left-1/2 z-(--z-toast) -translate-x-1/2",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        <AnimatePresence>
          {open ? (
            <motion.span
              className="block whitespace-nowrap rounded-pill border border-carbon bg-sun px-3 py-1.5 type-label text-carbon"
              initial={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
              transition={spring.release}
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </span>
  );
}
