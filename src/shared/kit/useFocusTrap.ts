import { useEffect, useRef, useState, type RefObject } from "react";

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
  // Read on the first render: by the time effects run, a field inside may
  // already have taken focus with autoFocus, and that field isn't the opener.
  const [previous] = useState(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null));
  const focusedOnOpen = useRef<HTMLElement | null>(null);

  useEffect(() => {
    escapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);

    // An explicit target wins; otherwise respect a field that already took
    // focus (autoFocus) — also on a re-run of this effect, after the cleanup
    // has handed focus back — and only fall back to the first control.
    const autoFocused = node.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
    const remembered = focusedOnOpen.current && node.contains(focusedOnOpen.current) ? focusedOnOpen.current : null;
    const target = initialFocus?.current ?? autoFocused ?? remembered ?? focusables()[0] ?? node;
    focusedOnOpen.current = target;
    target.focus({ preventScroll: true });

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
      // What opened it may be gone (a deleted comment took its menu with it);
      // then focus lands on the page's main region rather than the document.
      const target = previous?.isConnected ? previous : document.getElementById("content");
      target?.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus, previous]);
}
