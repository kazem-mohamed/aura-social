import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface FocusTrapOptions {
  initialFocus?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  active?: boolean;
}

/**
 * Keeps Tab inside `ref` while active, focuses the first control (or
 * `initialFocus`) on open, closes on Escape, and returns focus to whatever
 * had it before.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, { initialFocus, onEscape, active = true }: FocusTrapOptions) {
  const escapeRef = useRef(onEscape);

  useEffect(() => {
    escapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);

    (initialFocus?.current ?? focusables()[0] ?? node).focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && escapeRef.current) {
        event.stopPropagation();
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus]);
}
