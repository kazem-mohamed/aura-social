type LandingModule = typeof import("@/pages/LandingPage");

let loaded: LandingModule | undefined;

/** The landing chunk. Shared by the router and by sign-out, which warms it before swapping the shell. */
export const loadLandingPage = () => import("@/pages/LandingPage").then((module) => (loaded = module));

/** The landing page once its chunk has arrived, so it can render without suspending. */
export const loadedLandingPage = () => loaded?.default;
