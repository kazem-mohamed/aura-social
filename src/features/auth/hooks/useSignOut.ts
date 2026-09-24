import { flushSync } from "react-dom";
import { useNavigate } from "react-router";
import { useToast } from "@/shared/kit/toast/useToast";
import { swapShell } from "@/shared/lib/shellSwap";
import { loadLandingPage } from "@/app/router/landing";
import { routes } from "@/app/router/routes";
import { useAuth } from "./useAuth";

/** Resolves once `selector` is in the document, or after `timeout` ms regardless. */
function whenPresent(selector: string, timeout = 1000): Promise<void> {
  return new Promise((resolve) => {
    const started = performance.now();
    const check = () => {
      if (document.querySelector(selector) || performance.now() - started > timeout) resolve();
      else window.setTimeout(check, 16);
    };
    check();
  });
}

/**
 * Sign out onto the front door. Inside one view transition the page moves to
 * `/`, the session ends and the landing renders — so the dock peels up into
 * the landing's nav instead of the screen simply changing.
 */
export function useSignOut() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  return async () => {
    // Warm the landing chunk first, so it is ready inside the transition.
    await loadLandingPage().catch(() => undefined);
    await swapShell(async () => {
      // The router commits navigations in a transition; without `flushSync` the
      // session ends while the page is still a member route, and the auth guard
      // sends you to sign-in instead of the front door.
      await navigate(routes.home, { replace: true, flushSync: true });
      flushSync(signOut);
      await whenPresent("[data-landing]");
    });
    toast.show({ title: "Signed out. See you soon." });
  };
}
