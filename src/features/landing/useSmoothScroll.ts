import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

/** Lenis on the landing only: made on mount, destroyed on unmount, never under reduced motion. */
export function useSmoothScroll() {
  const { reduced } = useMotionPrefs();

  useEffect(() => {
    if (reduced) return;
    // The offset keeps anchored sections clear of the sticky guest nav.
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -88 } });
    return () => lenis.destroy();
  }, [reduced]);
}
