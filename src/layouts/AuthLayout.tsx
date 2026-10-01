import { Outlet, ScrollRestoration } from "react-router";
import { DocumentTitle } from "./components/DocumentTitle";
import { GuestNav } from "./components/GuestNav";
import { SkipLink } from "./components/SkipLink";

/** Shell for sign-in and sign-up: the guest nav, then the page. */
export default function AuthLayout() {
  return (
    <>
      <DocumentTitle />
      <ScrollRestoration />
      <SkipLink />
      <GuestNav className="mt-3" />
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-(--page-max) px-4 pb-16 outline-none sm:px-8">
        <Outlet />
      </main>
    </>
  );
}
