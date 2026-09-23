import { STICKER_PATHS, type StickerName } from "./stickerPaths";

export interface StickerProps {
  name: StickerName;
  /** Any colour value; sticker palette tokens such as `var(--ember)`. */
  fill?: string;
  /** Pixel size (square). Omit to size with CSS. */
  size?: number;
  /** Degrees. Decoration only — UI stickers stay at 0. */
  tilt?: number;
  /** Black outline in CSS pixels — 1.5 for UI, 3 for display stickers. */
  outline?: number;
  /** Colour of the tick / cross / dot marks. */
  markColor?: string;
  /** Accessible name; omit for decorative stickers. */
  title?: string;
  className?: string;
}

/**
 * A flat die-cut sticker. On Night paper it gains a bone die-cut edge from
 * `--cut`; on Paper that edge is transparent.
 */
export function Sticker({
  name,
  fill = "var(--blue)",
  size,
  tilt = 0,
  outline = 1.5,
  markColor = "var(--carbon)",
  title,
  className,
}: StickerProps) {
  const art = STICKER_PATHS[name];

  return (
    <svg
      viewBox="-10 -10 120 120"
      width={size}
      height={size}
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      <g style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={14} strokeLinejoin="round">
        {art.body.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g style={{ fill, stroke: "var(--carbon)" }} strokeWidth={outline} strokeLinejoin="round">
        {art.body.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {art.marks?.map((mark) =>
        mark.fill ? (
          <path key={mark.d} d={mark.d} style={{ fill: markColor }} />
        ) : (
          <path
            key={mark.d}
            d={mark.d}
            style={{ fill: "none", stroke: markColor }}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
}
