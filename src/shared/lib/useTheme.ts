import { useSyncExternalStore } from "react";
import { readTheme, setTheme, watchSystemTheme, type Theme } from "./theme";

function subscribe(notify: () => void): () => void {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const stopWatching = watchSystemTheme(() => notify());
  return () => {
    observer.disconnect();
    stopWatching();
  };
}

/**
 * The live theme, shared by every caller (it reads the `data-theme`
 * attribute), plus setters that run the peel transition from `origin`.
 */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "light");

  return {
    theme,
    set: (next: Theme, origin?: { x: number; y: number }) => setTheme(next, origin),
    toggle: (origin?: { x: number; y: number }) => setTheme(theme === "dark" ? "light" : "dark", origin),
  };
}
