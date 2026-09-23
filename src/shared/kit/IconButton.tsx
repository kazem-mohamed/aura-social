import { motion, type HTMLMotionProps } from "framer-motion";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";

const DIMENSIONS = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-13 w-13" } as const;
const TONES = {
  primary: "border-action bg-action text-action-ink",
  secondary: "border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "border-transparent bg-transparent text-ink hover:bg-surface-2",
} as const;

export interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children" | "aria-label"> {
  glyph: GlyphName;
  /** Accessible name — required, since there is no visible text. */
  label: string;
  variant?: keyof typeof TONES;
  size?: keyof typeof DIMENSIONS;
  /** Unread-style count sticker in the corner. */
  badge?: number;
}

export function IconButton({ glyph, label, variant = "secondary", size = "md", badge, disabled, type = "button", className, ...rest }: IconButtonProps) {
  const { reduced } = useMotionPrefs();
  const lively = !reduced && !disabled;

  return (
    <motion.button
      type={type}
      aria-label={badge ? `${label}, ${badge} new` : label}
      disabled={disabled}
      className={cx(
        "relative grid shrink-0 place-items-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        DIMENSIONS[size],
        TONES[variant],
        className,
      )}
      whileHover={lively ? { rotate: -6, y: -1 } : undefined}
      whileTap={lively ? { scale: 0.9, transition: spring.press } : undefined}
      transition={spring.release}
      {...rest}
    >
      <Glyph name={glyph} size={size === "sm" ? 18 : 20} />
      {badge ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-pill border border-carbon bg-ember px-1 text-[10px] font-bold text-carbon tnum"
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </motion.button>
  );
}
