import { motion } from "framer-motion";
import { Fragment, useLayoutEffect, useRef, type ReactNode } from "react";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";
import { useFitText } from "./useFitText";

/** Below this size a one-line name stops reading as a poster, so it stacks instead. */
const MIN_ONE_LINE_PX = 64;

/**
 * A person's name as a poster. It stays on one line while that line can be
 * set large; on narrow screens it stacks — first name, then the rest — and
 * each line is fitted to the full width. Lines are `[data-line]` children; the
 * box carries `data-stack` so CSS can switch them between inline and block.
 */
function usePosterName<T extends HTMLElement>(title: string) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;
    const lines = [...box.querySelectorAll<HTMLElement>("[data-line]")];

    const fit = () => {
      const available = box.clientWidth;
      if (!available || lines.length === 0) return;
      const cap = Math.max(48, window.innerHeight * 0.24);

      // Measure every line on its own at 100px.
      box.dataset.stack = "true";
      const widths = lines.map((line) => {
        line.style.fontSize = "100px";
        return line.scrollWidth;
      });
      const space = 28; // a word space is ~0.28em in the display face
      const oneLine = widths.reduce((sum, width) => sum + width, 0) + space * (lines.length - 1);
      const single = Math.floor((100 * available) / oneLine);

      if (lines.length === 1 || single >= MIN_ONE_LINE_PX) {
        box.dataset.stack = "false";
        lines.forEach((line) => (line.style.fontSize = `${Math.min(cap, single)}px`));
        // The space estimate can be a hair off; trim until the line fits.
        if (box.scrollWidth > available) {
          const trimmed = Math.floor((Math.min(cap, single) * available) / box.scrollWidth);
          lines.forEach((line) => (line.style.fontSize = `${trimmed}px`));
        }
      } else {
        lines.forEach((line, index) => {
          line.style.fontSize = `${Math.min(cap, Math.floor((100 * available) / widths[index]))}px`;
        });
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    window.addEventListener("resize", fit);
    void document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [title]);

  return ref;
}

interface PosterHeaderProps {
  /** The page's name in crushed display type — it is the page's `<h1>`. */
  title: string;
  /** One line under the poster: context, or a person's handle. Never a label above it. */
  lede?: ReactNode;
  actions?: ReactNode;
  /** `xl` is for a person's name on their profile. */
  size?: "poster" | "xl";
  children?: ReactNode;
  className?: string;
}

/**
 * Every member page opens like a poster: its name, huge and crushed, pressed
 * onto the page with a small squash as it lands. A page title stays on one
 * line and shrinks to fit; a person's name may stack into fitted lines.
 */
export function PosterHeader({ title, lede, actions, size = "poster", children, className }: PosterHeaderProps) {
  const titleRef = useFitText<HTMLHeadingElement>(title);
  const nameRef = usePosterName<HTMLHeadingElement>(title);
  const isName = size === "xl";
  const words = title.trim().split(/\s+/);
  const lines = isName && words.length > 1 ? [words[0], words.slice(1).join(" ")] : [title];

  return (
    <header className={cx("grid grid-cols-[minmax(0,1fr)] gap-5 pt-8 pb-8 sm:pt-12 sm:pb-10", className)}>
      <motion.h1
        ref={isName ? nameRef : titleRef}
        className={cx(isName ? "group type-display-xl" : "type-poster", "min-w-0 whitespace-nowrap")}
        style={{ transformOrigin: "0% 100%" }}
        initial={{ scaleY: 0.82, scaleX: 1.04 }}
        animate={{ scaleY: 1, scaleX: 1 }}
        transition={spring.release}
      >
        {isName
          ? lines.map((line, index) => (
              <Fragment key={index}>
                {index > 0 ? " " : null}
                <span data-line className="group-data-[stack=true]:block group-data-[stack=true]:w-max">
                  {line}
                </span>
              </Fragment>
            ))
          : title}
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
