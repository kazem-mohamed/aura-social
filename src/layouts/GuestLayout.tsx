import { Outlet, useMatch } from "react-router";
import { ShellHeader } from "./components/ShellHeader";
import { SkipLink } from "./components/SkipLink";

/**
 * Signed-out visitors on app routes (the 404, for now). `/` renders bare —
 * the landing page (Phase 4) brings its own navigation.
 */
export function GuestLayout() {
  const isFrontDoor = useMatch({ path: "/", end: true });

  return (
    <>
      <SkipLink />
      {isFrontDoor ? null : <ShellHeader />}
      <main id="content" tabIndex={-1} className={isFrontDoor ? "outline-none" : "mx-auto w-full max-w-(--page-max) px-4 pb-16 outline-none sm:px-8"}>
        <Outlet />
      </main>
    </>
  );
}
