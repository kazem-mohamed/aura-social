import { lazy, Suspense, useState } from "react";
import { RouteFallback } from "@/layouts/components/RouteFallback";
import { loadedLandingPage, loadLandingPage } from "./landing";

const LandingPage = lazy(loadLandingPage);

/**
 * The front door. Once sign-out has warmed its code it renders directly: as a
 * lazy page it would suspend under the fresh guest shell, show its fallback,
 * and React holds a fallback for 300ms before revealing what replaces it.
 */
export function LandingRoute() {
  const [Loaded] = useState(() => loadedLandingPage());
  if (Loaded) return <Loaded />;
  return (
    <Suspense fallback={<RouteFallback />}>
      <LandingPage />
    </Suspense>
  );
}
