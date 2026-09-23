import { useLayoutEffect, useRef } from "react";

/**
 * Poster setting: every `[data-line]` child is sized so it spans the box
 * exactly, capped at a share of the viewport height so the block always fits
 * the first screen. Re-fits on resize and once the web fonts arrive.
 * Lines need `display: block; width: max-content`.
 */
export function usePosterLines<T extends HTMLElement>(heightShare = 0.3) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;

    const fit = () => {
      const available = box.clientWidth;
      const cap = Math.max(40, window.innerHeight * heightShare);
      box.querySelectorAll<HTMLElement>("[data-line]").forEach((line) => {
        line.style.fontSize = "100px";
        const natural = line.scrollWidth;
        if (natural > 0 && available > 0) {
          line.style.fontSize = `${Math.min(cap, Math.floor((100 * available) / natural))}px`;
        }
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    window.addEventListener("resize", fit);
    void document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [heightShare]);

  return ref;
}
