import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "@/layouts/AuthLayout";
import RootLayout from "@/layouts/RootLayout";
import { RouteFallback } from "@/layouts/components/RouteFallback";
import { HomeGate } from "./HomeGate";
import { LegacyPostRedirect } from "./LegacyRedirect";
import { RequireAuth, RequireGuest } from "./RouteGuards";
import { routes } from "./routes";

/** Pages are code-split; each downloads when its route is first visited. */
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const PeoplePage = lazy(() => import("@/pages/PeoplePage"));
const PostDetailsPage = lazy(() => import("@/pages/PostDetailsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
/** Development-only design-system specimen page; compiled out of production builds. */
const KitPage = import.meta.env.DEV ? lazy(() => import("@/pages/kit/KitPage")) : null;

function lazyRoute(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

const devRoutes = KitPage ? [{ path: "/__kit", element: lazyRoute(<KitPage />) }] : [];

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <RootLayout />,
    children: [
      // Members see the wall; guests go to sign-in until the landing page ships (Phase 4).
      { index: true, element: <HomeGate member={lazyRoute(<HomePage />)} guest={<Navigate to={routes.login} replace />} /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "profile", element: lazyRoute(<ProfilePage />) },
          { path: "profile/:userId", element: lazyRoute(<ProfilePage />) },
          { path: "settings", element: lazyRoute(<SettingsPage />) },
          { path: "notifications", element: lazyRoute(<NotificationsPage />) },
          { path: "people", element: lazyRoute(<PeoplePage />) },
          { path: "post/:postId", element: lazyRoute(<PostDetailsPage />) },

          // Kept so links created before the routes were lowercased still work.
          { path: "Setting", element: <Navigate to={routes.settings} replace /> },
          { path: "setting", element: <Navigate to={routes.settings} replace /> },
          { path: "PostDetails/:postId", element: <LegacyPostRedirect /> },
        ],
      },
      // Unknown paths render 404 for everyone, signed in or not.
      { path: "*", element: lazyRoute(<NotFoundPage />) },
    ],
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          { path: "login", element: lazyRoute(<LoginPage />) },
          { path: "register", element: lazyRoute(<RegisterPage />) },
        ],
      },
    ],
  },
  ...devRoutes,
]);
