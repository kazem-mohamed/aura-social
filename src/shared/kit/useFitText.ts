import { useLayoutEffect, useRef } from "react";

/**
 * Crushed display type is set huge on purpose. This keeps a single line of
 * it inside its box: the font size steps down until the text stops
 * overflowing, and re-fits on resize and once web fonts arrive.
 * The element needs `white-space: nowrap`.
 */
export function useFitText<T extends HTMLElement>(text: string) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.fontSize = "";
      const available = el.clientWidth;
      const needed = el.scrollWidth;
      if (needed > available && available > 0) {
        const size = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = `${Math.floor((size * available) / needed)}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    void document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [text]);

  return ref;
}
