import { Logo } from "./Logo";

interface PeelLoaderProps {
  /** Square size in pixels. */
  size?: number;
  /** Announced to screen readers. */
  label?: string;
  className?: string;
}

/**
 * The brand loader: the symbol's corner peels up and settles in a loop.
 * Under reduced motion it holds still and still announces its label.
 */
export function PeelLoader({ size = 40, label = "Loading", className }: PeelLoaderProps) {
  return (
    <span role="status" aria-label={label} className={className} style={{ display: "inline-block", width: size, height: size }}>
      <Logo variant="symbol" loop title={null} className="h-full w-full" />
    </span>
  );
}
