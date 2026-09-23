import { PeelLoader } from "@/shared/brand/PeelLoader";

/** While a route's code downloads: the brand loader, centred. */
export function RouteFallback() {
  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <PeelLoader size={56} label="Loading page" />
    </div>
  );
}
