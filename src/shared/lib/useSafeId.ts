import { useId } from "react";

/**
 * `useId()` with the punctuation stripped, so the result can be used inside
 * `url(#…)` references (clip paths, gradients) without escaping.
 */
export function useSafeId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
