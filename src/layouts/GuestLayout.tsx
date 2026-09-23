import { Outlet, useMatch } from "react-router";
import { GuestNav } from "./components/GuestNav";
import { SkipLink } from "./components/SkipLink";

/**
 * Signed-out visitors. The landing at `/` brings its own header, nav, main and
 * footer; every other guest page (the 404) gets the guest nav and a main.
 */
export function GuestLayout() {
  const isFrontDoor = useMatch({ path: "/", end: true });

  if (isFrontDoor) {
    return (
      <>
        <SkipLink />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <GuestNav className="mt-3" />
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-(--page-max) px-4 pb-16 outline-none sm:px-8">
        <Outlet />
      </main>
    </>
  );
}
