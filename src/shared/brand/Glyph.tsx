import { GLYPH_PATHS, type GlyphName } from "./glyphPaths";

interface GlyphProps {
  name: GlyphName;
  size?: number;
  strokeWidth?: number;
  /** Accessible name; omit when the glyph sits next to visible text. */
  title?: string;
  className?: string;
}

/** Line glyph for UI chrome, drawn in the stickers' geometry. Inherits `currentColor`. */
export function Glyph({ name, size = 20, strokeWidth = 1.75, title, className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPH_PATHS[name].map((part) =>
        "fill" in part && part.fill ? (
          <path key={part.d} d={part.d} fill="currentColor" stroke="none" />
        ) : (
          <path key={part.d} d={part.d} />
        ),
      )}
    </svg>
  );
}
