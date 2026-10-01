import { Marquee } from "@/shared/kit/Marquee";
import { GuestNav } from "@/layouts/components/GuestNav";
import { FeatureWall } from "@/features/landing/components/FeatureWall";
import { Hero } from "@/features/landing/components/Hero";
import { HowItFeels } from "@/features/landing/components/HowItFeels";
import { JoinBand } from "@/features/landing/components/JoinBand";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { YourSticker } from "@/features/landing/components/YourSticker";
import { useSmoothScroll } from "@/features/landing/useSmoothScroll";

const TICKER = [
  "Everything here breathes",
  "Like it and it inflates",
  "Save it and it sticks",
  "Follow and it peels",
  "Empty just means waiting for breath",
];

/** The front door for guests: the slap, how it feels, your sticker, the wall, and the way in. */
export default function LandingPage() {
  useSmoothScroll();

  return (
    <div data-landing>
      <header>
        <Marquee items={TICKER} />
      </header>
      {/* The nav floats over the hero's sky, so it takes no room of its own. */}
      <GuestNav className="mt-3 -mb-16" />
      {/* overflow-x-clip: stickers arrive tilted and must not widen the page. It is not a scroll container, so the pinned section still sticks. */}
      <main id="content" tabIndex={-1} className="overflow-x-clip outline-none">
        <Hero />
        <HowItFeels />
        <YourSticker />
        <FeatureWall />
        <JoinBand />
      </main>
      <LandingFooter />
    </div>
  );
}
