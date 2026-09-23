import { Outlet } from "react-router";
import { ComposerProvider } from "@/features/posts/composer/ComposerProvider";
import { Dock } from "./components/Dock";
import { ShellHeader } from "./components/ShellHeader";
import { SkipLink } from "./components/SkipLink";

/** The member shell: logo top-left, the page, and the dock. No top bar. */
export function MainLayout() {
  return (
    <ComposerProvider>
      <SkipLink />
      <ShellHeader />
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-(--page-max) px-4 pb-36 outline-none sm:px-8">
        <Outlet />
      </main>
      <Dock />
    </ComposerProvider>
  );
}
