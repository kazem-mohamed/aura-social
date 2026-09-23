import { Link, useLocation } from "react-router";
import { Logo } from "@/shared/brand/Logo";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { cx } from "@/shared/kit/cx";
import { routes } from "@/app/router/routes";

const SECTIONS = [
  { hash: "#feel", label: "How it feels" },
  { hash: "#sticker", label: "Your sticker" },
];

/** Display is set per item: the section links only exist from `md` up. */
const ITEM = "h-10 items-center rounded-pill px-4 type-label transition-colors duration-200 hover:bg-action-ink/10";

/**
 * The guest pill: the dock's twin at the top of the screen. It carries the
 * dock's view-transition name, so signing in carries it down into the dock.
 */
export function GuestNav({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const onLanding = pathname === routes.home;

  return (
    <nav
      aria-label="Primary"
      className={cx(
        "sticky top-3 z-(--z-dock) mx-auto flex w-fit max-w-[calc(100%-24px)] items-center gap-1 rounded-pill border border-line bg-action p-1.5 text-action-ink [view-transition-name:dock]",
        className,
      )}
    >
      <Link to={routes.home} viewTransition aria-label="Aura — home" className="grid h-10 shrink-0 place-items-center rounded-pill px-1.5">
        <Logo title={null} className="h-8 w-auto" />
      </Link>
      {onLanding
        ? SECTIONS.map((section) => (
            <a key={section.hash} href={section.hash} className={cx(ITEM, "hidden md:inline-flex")}>
              {section.label}
            </a>
          ))
        : null}
      <Link to={routes.login} viewTransition className={cx(ITEM, "inline-flex")}>
        Sign in
      </Link>
      <ButtonLink to={routes.register} viewTransition variant="sticker" fill="sun" size="sm" className="h-10">
        Join Aura
      </ButtonLink>
    </nav>
  );
}
