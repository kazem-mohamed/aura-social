import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { PeelLoader } from "@/shared/brand/PeelLoader";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { buttonClasses, type ButtonSize, type ButtonVariant, type StickerFill } from "./buttonStyles";
import { cx } from "./cx";

const ICON_SIZE = { sm: 16, md: 18, lg: 20 } as const;

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fill for the `sticker` variant — landing CTAs only. */
  fill?: StickerFill;
  /** Replaces the label with the peel loader and blocks presses; the width stays put. */
  loading?: boolean;
  /** Swaps the leading icon for a tick after a successful action. */
  success?: boolean;
  iconStart?: GlyphName;
  iconEnd?: GlyphName;
  fullWidth?: boolean;
  children: ReactNode;
}

/** Sticker-physics button: lifts and tilts on hover, squishes on press, springs back. */
export function Button({
  variant = "primary",
  size = "md",
  fill = "sun",
  loading = false,
  success = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  const { reduced } = useMotionPrefs();
  const lively = !reduced && !disabled && !loading && variant !== "link";
  const icon = ICON_SIZE[size];

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonClasses({ variant, size, fill }), fullWidth && "w-full", className)}
      whileHover={lively ? { y: -2, rotate: -1.5 } : undefined}
      whileTap={lively ? { scale: 0.94, transition: spring.press } : undefined}
      transition={spring.release}
      {...rest}
    >
      <span className={cx("inline-flex items-center gap-2", loading && "invisible")}>
        {success ? (
          <Glyph name="check" size={icon} strokeWidth={2.5} />
        ) : iconStart ? (
          <Glyph name={iconStart} size={icon} />
        ) : null}
        {children}
        {iconEnd ? <Glyph name={iconEnd} size={icon} /> : null}
      </span>
      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <PeelLoader size={icon + 8} label="Working" />
        </span>
      ) : null}
    </motion.button>
  );
}
