import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { useSafeId } from "@/shared/lib/useSafeId";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { GLYPH_A_PATH, WORD_PATH } from "./logoPaths";
import { foldGeometry, roundFold } from "./peel";

type StickerVariant = "primary" | "symbol";
export type LogoVariant = StickerVariant | "round" | "horizontal";

interface StickerSpec {
  width: number;
  height: number;
  radius: number;
  /** Peel depth at rest — equals x, the wordmark's x-height (spec §5.1). */
  rest: number;
  /** Peel depth on hover. */
  lift: number;
  tilt: number;
  viewBox: string;
  art: (fill: string) => ReactNode;
}

const SPECS: Record<StickerVariant, StickerSpec> = {
  primary: {
    width: 400,
    height: 170,
    radius: 52,
    rest: 64,
    lift: 96,
    tilt: -4,
    viewBox: "-24 -32 448 234",
    art: (fill) => <path d={WORD_PATH} transform="translate(41.3 117) scale(1.08)" style={{ fill }} />,
  },
  symbol: {
    width: 200,
    height: 200,
    radius: 56,
    rest: 64,
    lift: 100,
    tilt: 0,
    viewBox: "-16 -16 232 232",
    art: (fill) => <path d={GLYPH_A_PATH} transform="translate(35.04 151.75) scale(1.55)" style={{ fill }} />,
  },
};

const PEEL_SPRING = { type: "spring", stiffness: 380, damping: 16 } as const;

export interface LogoProps {
  variant?: LogoVariant;
  /** Sticker fill. The product always wears Electric Blue; other fills are landing-only. */
  fill?: string;
  /** Wordmark colour on the sticker. */
  ink?: string;
  /** One-colour version: ink sticker, ground-coloured letters. */
  mono?: boolean;
  /** Lift the corner on hover. */
  interactive?: boolean;
  /** Slap the sticker on once when it mounts, then lift the corner. */
  slapIn?: boolean;
  /** Keep the corner breathing — the brand loader. Symbol only. */
  loop?: boolean;
  /** Override the placement tilt in degrees (the app icon uses −6). */
  tilt?: number;
  /** Outline width in CSS pixels; constant at every size. */
  outline?: number;
  /** Accessible name. `null` marks the logo decorative. */
  title?: string | null;
  className?: string;
}

interface StickerLogoProps extends LogoProps {
  spec: StickerSpec;
  nested?: { x: number; y: number; width: number; height: number };
}

function StickerLogo({
  spec,
  nested,
  fill,
  ink,
  mono = false,
  interactive = false,
  slapIn = false,
  loop = false,
  tilt,
  outline = 1.5,
  title = "Aura",
  className,
}: StickerLogoProps) {
  const { reduced } = useMotionPrefs();
  const clipId = useSafeId("peel");
  const depth = useMotionValue(slapIn && !reduced ? spec.radius + 1 : spec.rest);
  const clip = useTransform(depth, (p) => foldGeometry(spec.width, spec.radius, p).clip);
  const flap = useTransform(depth, (p) => foldGeometry(spec.width, spec.radius, p).flap);

  const peelTo = (target: number) => {
    if (reduced) {
      depth.set(target);
      return;
    }
    animate(depth, target, PEEL_SPRING);
  };

  useEffect(() => {
    if (!loop || reduced) return;
    const low = spec.radius + 2;
    const high = spec.radius + 48;
    const controls = animate(depth, [low, high, low], { duration: 1.6, ease: "easeInOut", repeat: Infinity });
    return () => controls.stop();
  }, [loop, reduced, depth, spec.radius]);

  const bodyFill = mono ? "var(--ink)" : (fill ?? "var(--blue)");
  const letterFill = mono ? "var(--ground)" : (ink ?? "var(--carbon)");
  const edge = mono ? "var(--ink)" : "var(--carbon)";
  const flapFill = mono ? "var(--ground)" : "var(--paper)";
  const angle = tilt ?? spec.tilt;

  const body = (
    <g transform={`rotate(${angle} ${spec.width / 2} ${spec.height / 2})`}>
      <g clipPath={`url(#${clipId})`}>
        <rect width={spec.width} height={spec.height} rx={spec.radius} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} />
      </g>
      <motion.path d={flap} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        <rect
          width={spec.width}
          height={spec.height}
          rx={spec.radius}
          style={{ fill: bodyFill, stroke: edge }}
          strokeWidth={outline}
          vectorEffect="non-scaling-stroke"
        />
        {spec.art(letterFill)}
      </g>
      <motion.path
        d={flap}
        style={{ fill: flapFill, stroke: edge }}
        strokeWidth={outline}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </g>
  );

  return (
    <svg
      viewBox={spec.viewBox}
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      onPointerEnter={interactive ? () => peelTo(spec.lift) : undefined}
      onPointerLeave={interactive ? () => peelTo(spec.rest) : undefined}
      {...nested}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <motion.path d={clip} />
        </clipPath>
      </defs>
      {slapIn && !reduced ? (
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          initial={{ opacity: 0, y: -24, rotate: -10, scaleX: 1.3, scaleY: 1.3 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scaleX: [1.3, 1.07, 0.98, 1], scaleY: [1.3, 0.93, 1.02, 1] }}
          transition={{ duration: 0.62, times: [0, 0.55, 0.78, 1], ease: [0.2, 0.8, 0.2, 1] }}
          onAnimationComplete={() => peelTo(spec.rest)}
        >
          {body}
        </motion.g>
      ) : (
        body
      )}
    </svg>
  );
}

function RoundLogo({ fill, ink, mono = false, outline = 1.5, title = "Aura", className }: LogoProps) {
  const clipId = useSafeId("round");
  const { clip, flap } = roundFold(110, 110, 100, 80);
  const bodyFill = mono ? "var(--ink)" : (fill ?? "var(--blue)");
  const letterFill = mono ? "var(--ground)" : (ink ?? "var(--carbon)");
  const edge = mono ? "var(--ink)" : "var(--carbon)";

  return (
    <svg
      viewBox="-16 -16 252 252"
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={clip} />
        </clipPath>
      </defs>
      <g transform="rotate(-4 110 110)">
        <g clipPath={`url(#${clipId})`}>
          <circle cx={110} cy={110} r={100} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} />
        </g>
        <path d={flap} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} strokeLinejoin="round" />
        <g clipPath={`url(#${clipId})`}>
          <circle cx={110} cy={110} r={100} style={{ fill: bodyFill, stroke: edge }} strokeWidth={outline} vectorEffect="non-scaling-stroke" />
          <path d={WORD_PATH} transform="translate(24.5 129.2) scale(0.58)" style={{ fill: letterFill }} />
        </g>
        <path
          d={flap}
          style={{ fill: mono ? "var(--ground)" : "var(--paper)", stroke: edge }}
          strokeWidth={outline}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function HorizontalLogo({ mono = false, outline = 1.5, interactive = false, title = "Aura", className }: LogoProps) {
  return (
    <svg
      viewBox="-12 -12 348 124"
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      <StickerLogo
        spec={SPECS.symbol}
        nested={{ x: -8, y: -8, width: 116, height: 116 }}
        mono={mono}
        outline={outline}
        interactive={interactive}
        title={null}
      />
      <path d={WORD_PATH} transform="translate(120 75.9) scale(0.742)" style={{ fill: "var(--ink)" }} />
    </svg>
  );
}

/**
 * The Aura logo — a die-cut sticker slapped on at −4°, lifting at its
 * top-right corner (spec §5.1). The wordmark is outlined, so the logo never
 * waits for a font.
 */
export function Logo({ variant = "primary", ...props }: LogoProps) {
  if (variant === "round") return <RoundLogo {...props} />;
  if (variant === "horizontal") return <HorizontalLogo {...props} />;
  return <StickerLogo spec={SPECS[variant]} {...props} />;
}
