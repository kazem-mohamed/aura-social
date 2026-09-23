import { Link, type LinkProps } from "react-router";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { buttonClasses, type ButtonSize, type ButtonVariant, type StickerFill } from "./buttonStyles";
import { cx } from "./cx";

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fill?: StickerFill;
  iconEnd?: GlyphName;
}

/** A router link dressed as a button — same variants, CSS-only lift and press. */
export function ButtonLink({ variant = "primary", size = "md", fill = "sun", iconEnd, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link
      className={cx(
        buttonClasses({ variant, size, fill }),
        "duration-300 ease-spring hover:-translate-y-0.5 hover:-rotate-[1.5deg] active:scale-95 active:duration-75",
        className,
      )}
      {...rest}
    >
      {children}
      {iconEnd ? <Glyph name={iconEnd} size={size === "lg" ? 20 : 18} /> : null}
    </Link>
  );
}
