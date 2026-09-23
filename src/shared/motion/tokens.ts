import type { Transition } from "framer-motion";

/**
 * Motion tokens — spec §4.5. The CSS mirrors live in src/styles/tokens.css.
 * Springs for things you touch, eases for things that arrive.
 */
export const spring = {
  press: { type: "spring", stiffness: 700, damping: 30 },
  release: { type: "spring", stiffness: 420, damping: 18 },
  arrive: { type: "spring", stiffness: 260, damping: 22 },
} as const satisfies Record<string, Transition>;

export const ease = {
  spring: [0.34, 1.56, 0.64, 1],
  out: [0.16, 1, 0.3, 1],
} as const;

/** Seconds, as Motion expects them. */
export const duration = {
  press: 0.09,
  quick: 0.22,
  base: 0.38,
  arrive: 0.48,
  peel: 0.56,
  route: 0.36,
  breath: 4.8,
} as const;
