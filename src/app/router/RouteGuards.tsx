import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { markShellSwap } from "@/shared/lib/shellSwap";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { routes } from "./routes";

/**
 * Guards now read the session from `AuthProvider` instead of reading
 * `localStorage` during render, so signing out redirects immediately rather
 * than waiting for the next manual navigation.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Keeps signed-in users out of the sign-in and sign-up screens. The move to
 * the wall is a view transition marked as a shell swap, so the guest nav
 * travels down into the dock.
 */
export function RequireGuest() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    markShellSwap();
    void navigate(routes.home, { replace: true, viewTransition: true });
  }, [isAuthenticated, navigate]);

  return <Outlet />;
}
