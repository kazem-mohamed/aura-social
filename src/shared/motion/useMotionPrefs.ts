import { useReducedMotion } from "framer-motion";

/**
 * The one place components ask whether to animate. `MotionConfig` already
 * softens Motion animations for reduced-motion users; this hook is for the
 * things MotionConfig cannot see — loops, bursts, imperative animations.
 */
export function useMotionPrefs(): { reduced: boolean } {
  const reduced = useReducedMotion() ?? false;
  return { reduced };
}
