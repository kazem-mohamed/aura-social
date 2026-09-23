import { motion } from "framer-motion";
import { useState } from "react";
import { matchPath, NavLink, useLocation } from "react-router";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { cx } from "@/shared/kit/cx";
import { Tooltip } from "@/shared/kit/Tooltip";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/useNotifications";
import { useComposer } from "@/features/posts/composer/useComposer";

interface Destination {
  key: string;
  to: string;
  label: string;
  glyph: GlyphName;
  /** Paths (matched exactly) on which this item is the current page. */
  match: string[];
}

const LEFT: Destination[] = [
  { key: "wall", to: routes.home, label: "Wall", glyph: "wall", match: ["/"] },
  { key: "people", to: routes.people, label: "People", glyph: "people", match: ["/people"] },
];
const RIGHT: Destination[] = [
  { key: "alerts", to: routes.notifications, label: "Alerts", glyph: "bell", match: ["/notifications"] },
  { key: "you", to: routes.profile, label: "You", glyph: "user", match: ["/profile", "/settings"] },
];

function PostButton({ onClick }: { onClick: () => void }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="New post"
      className="mx-1 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-carbon bg-sun text-carbon"
      whileHover={reduced ? undefined : { rotate: 90, scale: 1.06 }}
      whileTap={reduced ? undefined : { scale: 0.9 }}
      transition={spring.release}
    >
      <Glyph name="plus" size={24} strokeWidth={2.25} />
    </motion.button>
  );
}

/**
 * The one navigation, on every device: a floating ink pill at thumb height.
 * The current page wears a sticker that slides between items; the Post
 * button in the middle opens the composer from anywhere.
 */
export function Dock() {
  // Arriving through a sign-in, the dock travels from the guest nav instead of sliding up.
  const [slidesIn] = useState(() => !document.documentElement.classList.contains("shell-swap"));
  const { pathname } = useLocation();
  const composer = useComposer();
  const { data: unread } = useUnreadNotificationCount();
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");

  const unreadCount = typeof unread === "number" ? unread : 0;
  const activeKey = [...LEFT, ...RIGHT].find((d) => d.match.some((path) => matchPath({ path, end: true }, pathname)))?.key;

  const renderItem = (destination: Destination) => {
    const isActive = activeKey === destination.key;
    const badge = destination.key === "alerts" ? unreadCount : 0;

    const link = (
      <NavLink
        key={destination.key}
        to={destination.to}
        viewTransition
        aria-label={badge ? `${destination.label}, ${badge} unread` : destination.label}
        aria-current={isActive ? "page" : undefined}
        className={cx(
          "relative isolate flex h-14 min-w-14 flex-col items-center justify-center gap-0.5 rounded-pill px-2 transition-colors duration-200",
          "sm:h-12 sm:min-w-12 sm:flex-row sm:px-3 lg:gap-2 lg:px-4",
          isActive ? "text-ink" : "text-action-ink hover:bg-action-ink/10",
        )}
      >
        {isActive ? (
          <motion.span layoutId="dock-active" aria-hidden className="absolute inset-0 -z-10 rounded-pill bg-ground" transition={spring.release} />
        ) : null}
        <span className="relative">
          <Glyph name={destination.glyph} size={22} />
          {badge ? (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-2 grid h-[18px] min-w-[18px] place-items-center rounded-pill border border-carbon bg-ember px-1 text-[10px] leading-none font-bold text-carbon tnum"
            >
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </span>
        <span className="text-[10px] font-bold tracking-[0.032em] uppercase sm:hidden lg:inline lg:text-[12px]">{destination.label}</span>
      </NavLink>
    );

    return isTablet ? (
      <Tooltip key={destination.key} label={destination.label}>
        {link}
      </Tooltip>
    ) : (
      link
    );
  };

  return (
    <nav
      aria-label="Primary"
      className={cx(
        slidesIn && "dock-enter",
        "fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 z-(--z-dock) -translate-x-1/2 [view-transition-name:dock]",
      )}
    >
      <div className="flex items-center gap-0.5 rounded-pill border border-line bg-action p-1.5 text-action-ink sm:gap-1">
        {LEFT.map(renderItem)}
        <PostButton onClick={composer.open} />
        {RIGHT.map(renderItem)}
      </div>
    </nav>
  );
}
