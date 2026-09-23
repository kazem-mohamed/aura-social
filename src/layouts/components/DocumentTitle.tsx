import { matchPath, useLocation } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";

const TITLE_RULES = [
  { path: "/", title: "Wall" },
  { path: "/people", title: "People" },
  { path: "/notifications", title: "Alerts" },
  { path: "/profile", title: "You" },
  { path: "/profile/:userId", title: "Profile" },
  { path: "/settings", title: "Settings" },
  { path: "/post/:postId", title: "Post" },
  { path: "/auth/login", title: "Sign in" },
  { path: "/auth/register", title: "Join" },
  { path: "/__kit", title: "Kit" },
];

/** Per-route document title. React 19 hoists `<title>` into `<head>`. */
export function DocumentTitle() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  // Guests at `/` are on the front door, which carries the brand line.
  if (pathname === "/" && !isAuthenticated) return <title>Aura — Everything here breathes</title>;

  const matched = TITLE_RULES.find((rule) => matchPath({ path: rule.path, end: true }, pathname));
  return <title>{`${matched?.title ?? "Not found"} · Aura`}</title>;
}
