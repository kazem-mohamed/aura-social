import type { MouseEvent } from "react";
import { Link } from "react-router";
import { Glyph } from "@/shared/brand/Glyph";
import { Logo } from "@/shared/brand/Logo";
import { useTheme } from "@/shared/lib/useTheme";
import { routes } from "@/app/router/routes";

const PILL =
  "inline-flex h-11 items-center gap-2 rounded-pill border border-action-ink/40 px-4 type-label transition-colors duration-200 hover:bg-action-ink/10";

/** The honest footer: what this is, and the ways in. */
export function LandingFooter() {
  const { theme, toggle } = useTheme();

  const switchPaper = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    toggle({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
  };

  return (
    <footer className="bg-action text-action-ink">
      <div className="mx-auto grid max-w-(--page-max) gap-8 px-4 py-12 sm:px-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-12">
        <Logo title="Aura" className="h-12 w-auto" />
        <p className="max-w-[56ch] type-body">
          A portfolio project built on the Route Academy practice API. The post and the names on this page are samples.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={routes.login} viewTransition className={PILL}>
            Sign in
          </Link>
          <Link to={routes.register} viewTransition className={PILL}>
            Join
          </Link>
          <button type="button" onClick={switchPaper} aria-pressed={theme === "dark"} className={PILL}>
            <Glyph name="moon" size={18} />
            Night paper
          </button>
        </div>
      </div>
    </footer>
  );
}
