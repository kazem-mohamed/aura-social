import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { duration } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

interface BreatheProps {
  children: ReactNode;
  /** Seconds before the first breath — staggers neighbours. */
  delay?: number;
  /** How far it swells, as a share of its size. */
  amount?: number;
}

/** The landing's loop: an object swells and settles every 4.8 s — only while on screen, never under reduced motion. */
export function Breathe({ children, delay = 0, amount = 0.06 }: BreatheProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const { reduced } = useMotionPrefs();
  const breathing = inView && !reduced;

  return (
    <motion.div
      ref={ref}
      animate={breathing ? { scale: [1, 1 + amount, 1] } : { scale: 1 }}
      transition={breathing ? { duration: duration.breath, ease: "easeInOut", repeat: Infinity, delay } : { duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
