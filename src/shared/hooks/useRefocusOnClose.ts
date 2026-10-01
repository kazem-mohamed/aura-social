import { useEffect, useRef, type RefObject } from "react";

/**
 * An inline editor takes focus into its field; when it closes, that field
 * leaves the document and focus would fall to the page. Instead it goes to the
 * first `selector` match inside `root` — typically the item's options button.
 * Focus the user has already moved elsewhere is left alone.
 */
export function useRefocusOnClose(open: boolean, root: RefObject<HTMLElement | null>, selector: string) {
  const wasOpen = useRef(open);

  useEffect(() => {
    const lost = !document.activeElement || document.activeElement === document.body;
    if (wasOpen.current && !open && lost) {
      root.current?.querySelector<HTMLElement>(selector)?.focus();
    }
    wasOpen.current = open;
  }, [open, root, selector]);
}
