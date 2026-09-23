import { Link } from "react-router";
import { Logo } from "@/shared/brand/Logo";
import { routes } from "@/app/router/routes";

/** The logo sticker, top-left. It scrolls away with the page; the dock owns persistence. */
export function ShellHeader() {
  return (
    <header className="mx-auto flex w-full max-w-(--page-max) items-center px-4 pt-4 sm:px-8 sm:pt-6">
      <Link to={routes.home} viewTransition aria-label="Aura — back to the wall" className="rounded-chip">
        <Logo interactive title={null} className="h-11 w-auto sm:h-12" />
      </Link>
    </header>
  );
}
