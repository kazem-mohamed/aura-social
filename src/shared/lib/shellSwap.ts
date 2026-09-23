const SWAP_CLASS = "shell-swap";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Signing in or out swaps the whole shell. Run inside one view transition,
 * the guest nav and the dock — both named `dock` — travel into each other:
 * the pill peels off one edge of the screen and slaps back on at the other.
 * `update` may be async; the new state is captured once it resolves.
 */
export async function swapShell(update: () => void | Promise<void>): Promise<void> {
  if (!document.startViewTransition || prefersReducedMotion()) {
    await update();
    return;
  }

  const root = document.documentElement;
  root.classList.add(SWAP_CLASS);
  const transition = document.startViewTransition(async () => {
    await update();
  });

  // An interrupted transition rejects its promises; the DOM update happens regardless.
  const ignore = () => {};
  transition.ready.catch(ignore);
  await transition.updateCallbackDone.catch(ignore);
  void transition.finished.catch(ignore).finally(() => root.classList.remove(SWAP_CLASS));
}

/** For a transition React Router starts itself: mark it as a shell swap while it runs. */
export function markShellSwap(forMs = 1200): void {
  const root = document.documentElement;
  root.classList.add(SWAP_CLASS);
  window.setTimeout(() => root.classList.remove(SWAP_CLASS), forMs);
}
