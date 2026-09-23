import { motion, type HTMLMotionProps } from "framer-motion";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";

type CardVariant = "default" | "interactive" | "featured" | "compact" | "media" | "profile" | "content";
type Band = "sky" | "lav" | "sun" | "mint" | "concrete";

const PADDING: Record<CardVariant, string> = {
  default: "p-5 sm:p-6",
  interactive: "cursor-pointer p-5 sm:p-6",
  featured: "p-6 sm:p-8",
  compact: "p-3.5",
  media: "overflow-hidden p-0",
  profile: "grid justify-items-center gap-3 p-5 text-center sm:p-6",
  content: "p-5 type-body-lg sm:p-7",
};

const BANDS: Record<Band, string> = {
  sky: "bg-band-sky",
  lav: "bg-band-lav",
  sun: "bg-sun text-carbon",
  mint: "bg-mint text-carbon",
  concrete: "bg-band-concrete",
};

export interface CardProps extends HTMLMotionProps<"article"> {
  variant?: CardVariant;
  /** Colour band ground; `featured` defaults to Sky. */
  band?: Band;
}

/** A sticker-edged surface. `interactive` cards lift and tilt on hover and squish on press. */
export function Card({ variant = "default", band, className, ...rest }: CardProps) {
  const { reduced } = useMotionPrefs();
  const lively = variant === "interactive" && !reduced;
  const ground = band ? BANDS[band] : variant === "featured" ? BANDS.sky : "bg-surface";

  return (
    <motion.article
      className={cx("relative rounded-card border border-line", ground, PADDING[variant], className)}
      whileHover={lively ? { y: -3, rotate: -0.6 } : undefined}
      whileTap={lively ? { scale: 0.985 } : undefined}
      transition={spring.release}
      {...rest}
    />
  );
}
