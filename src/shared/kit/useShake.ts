import { useAnimate } from "framer-motion";
import { useEffect } from "react";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

/**
 * Shakes the returned element whenever `message` changes to a new non-empty
 * value — a field's error, typically. Nothing moves under reduced motion.
 */
export function useShake<T extends Element>(message: string | undefined) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<T>();

  useEffect(() => {
    if (!message || reduced || !scope.current) return;
    animate(scope.current, { x: [0, -6, 5, -3, 0] }, { duration: 0.38 });
  }, [message, reduced, animate, scope]);

  return scope;
}
