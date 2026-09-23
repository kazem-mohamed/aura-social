import { motion, useAnimate } from "framer-motion";
import { useState } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { STICKER_PATHS, type StickerName } from "@/shared/brand/stickerPaths";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { Counter } from "./Counter";
import { cx } from "./cx";

type ActionSize = "sm" | "md";

const PILL = "relative inline-flex items-center gap-2 rounded-pill px-2.5 font-bold text-ink transition-colors duration-200 hover:bg-surface-2 disabled:opacity-45";
const PILL_SIZE: Record<ActionSize, string> = { sm: "h-9 text-[13px]", md: "h-10 text-[14px]" };
const ICON: Record<ActionSize, number> = { sm: 18, md: 22 };
const BURST = ["var(--ember)", "var(--sun)", "var(--blue)", "var(--mint)", "var(--violet)", "var(--lavender)", "var(--ember)", "var(--sun)"];

/** The object's sticker silhouette: outlined at rest, filled once active. */
function ActionIcon({ name, active, fill, size }: { name: StickerName; active: boolean; fill: string; size: number }) {
  return (
    <svg viewBox="-6 -6 112 112" width={size} height={size} aria-hidden overflow="visible">
      <path
        d={STICKER_PATHS[name].body[0]}
        style={{ fill: active ? fill : "transparent", stroke: active ? "var(--carbon)" : "currentColor", transition: "fill 150ms ease" }}
        strokeWidth={1.75}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Eight palette dots flung outward — plays once per like. */
function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {BURST.map((color, index) => {
        const angle = (index / BURST.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 20 + (index % 2) * 6;
        return (
          <motion.i
            key={index}
            className="absolute top-1/2 left-1/2 -mt-1 -ml-1 h-2 w-2 rounded-full border border-carbon"
            style={{ background: color }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, scale: [0.4, 1, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  size?: ActionSize;
  label?: string;
}

/** Like: the heart inflates and overshoots, confetti bursts, the count rolls. Unlike deflates it. */
export function LikeButton({ liked, count, onToggle, disabled, size = "md", label = "Like" }: LikeButtonProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const [burst, setBurst] = useState(0);

  const toggle = () => {
    const next = !liked;
    onToggle();
    if (reduced || !scope.current) return;
    if (next) {
      animate(scope.current, { scale: [1, 1.38, 0.9, 1] }, { duration: 0.52, times: [0, 0.35, 0.68, 1], ease: [0.2, 0.8, 0.2, 1] });
      setBurst((value) => value + 1);
    } else {
      animate(scope.current, { scaleX: [1, 1.08, 1], scaleY: [1, 0.8, 1] }, { duration: 0.36 });
    }
  };

  return (
    <motion.button
      type="button"
      aria-pressed={liked}
      aria-label={`${label}, ${count} ${count === 1 ? "like" : "likes"}`}
      disabled={disabled}
      onClick={toggle}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.press}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <span className="relative grid place-items-center">
        <span ref={scope} className="grid place-items-center">
          <ActionIcon name="heart" active={liked} fill="var(--ember)" size={ICON[size]} />
        </span>
        {burst > 0 && !reduced ? <Burst key={burst} /> : null}
      </span>
      <Counter value={count} />
    </motion.button>
  );
}

interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: ActionSize;
  label?: string;
}

/** Save: the bookmark drops, squashes and sticks. */
export function SaveButton({ saved, onToggle, disabled, size = "md", label = "Save" }: SaveButtonProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLSpanElement>();

  const toggle = () => {
    const next = !saved;
    onToggle();
    if (reduced || !next || !scope.current) return;
    animate(
      scope.current,
      { y: [-14, 0, 0, 0], rotate: [-10, 0, 0, 0], scaleX: [1.15, 1.14, 0.96, 1], scaleY: [1.15, 0.82, 1.05, 1] },
      { duration: 0.56, times: [0, 0.55, 0.78, 1], ease: [0.2, 0.8, 0.2, 1] },
    );
  };

  return (
    <motion.button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      disabled={disabled}
      onClick={toggle}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.press}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <span ref={scope} className="grid place-items-center">
        <ActionIcon name="bookmark" active={saved} fill="var(--sun)" size={ICON[size]} />
      </span>
    </motion.button>
  );
}

interface CountActionProps {
  count: number;
  onClick: () => void;
  size?: ActionSize;
  label?: string;
}

/** Comment: opens the conversation. The bubble tilts on hover. */
export function CommentButton({ count, onClick, size = "md", label = "Comments" }: CountActionProps) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.button
      type="button"
      aria-label={`${label}, ${count}`}
      onClick={onClick}
      whileHover={reduced ? undefined : { rotate: -4 }}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.release}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <ActionIcon name="bubble" active={false} fill="var(--blue)" size={ICON[size]} />
      <Counter value={count} />
    </motion.button>
  );
}

/** Share: the loop spins once, then the share sheet opens. */
export function ShareButton({ count, onClick, size = "md", label = "Share" }: CountActionProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLSpanElement>();

  return (
    <motion.button
      type="button"
      aria-label={`${label}, ${count}`}
      onClick={() => {
        if (!reduced && scope.current) animate(scope.current, { rotate: [0, 360] }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
        onClick();
      }}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.press}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <span ref={scope} className="grid place-items-center">
        <ActionIcon name="share" active={false} fill="var(--violet)" size={ICON[size]} />
      </span>
      <Counter value={count} />
    </motion.button>
  );
}

interface FollowButtonProps {
  following: boolean;
  onToggle: () => void;
  pending?: boolean;
  size?: ActionSize;
  /** Whose follow this is, for the accessible name. */
  name?: string;
}

/** Follow: the ink layer peels away diagonally to reveal a mint "Following". */
export function FollowButton({ following, onToggle, pending = false, size = "md", name }: FollowButtonProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLButtonElement>();

  return (
    <button
      ref={scope}
      type="button"
      aria-pressed={following}
      aria-label={name ? `Follow ${name}` : "Follow"}
      disabled={pending}
      onClick={() => {
        const next = !following;
        onToggle();
        if (next && !reduced && scope.current) animate(scope.current, { rotate: [0, -4, 0] }, { duration: 0.52, ease: [0.34, 1.56, 0.64, 1] });
      }}
      className={cx(
        "kit-follow relative inline-grid shrink-0 overflow-hidden rounded-pill border border-line font-bold uppercase tracking-[0.032em] transition-[scale,opacity] duration-200 active:scale-95 disabled:cursor-wait disabled:opacity-60",
        size === "sm" ? "h-9 min-w-28 text-[11px]" : "h-11 min-w-36 text-[13px]",
      )}
    >
      <span aria-hidden className="col-start-1 row-start-1 flex items-center justify-center gap-1.5 bg-mint px-4 text-carbon">
        <Glyph name="check" size={16} strokeWidth={2.5} />
        Following
      </span>
      <span aria-hidden className="kit-follow-top col-start-1 row-start-1 flex items-center justify-center bg-action px-4 text-action-ink">
        Follow
      </span>
    </button>
  );
}
