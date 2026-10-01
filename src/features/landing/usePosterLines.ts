import { useLayoutEffect, useRef } from "react";

/**
 * Poster setting: every `[data-line]` child is sized so it spans the box
 * exactly, capped at a share of the viewport height so the block always fits
 * the first screen. Re-fits on resize and once the web fonts arrive.
 * Lines need `display: block; width: max-content`; a line that inflates
 * (`stretch-breath`) is always measured at rest.
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
        // Measure at rest: a line that is still inflating is narrower than
        // the width it settles at, and would be fitted too large.
        const live = line.style.getPropertyValue("--inflate");
        line.style.setProperty("--inflate", "1");
        line.style.fontSize = "100px";
        const natural = line.scrollWidth;
        if (live) line.style.setProperty("--inflate", live);
        else line.style.removeProperty("--inflate");
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
