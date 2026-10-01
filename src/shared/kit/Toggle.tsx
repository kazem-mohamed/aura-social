import { motion } from "framer-motion";
import { useId } from "react";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

/** A switch: the knob is a paper sticker that squishes as it slides. */
export function Toggle({ checked, onChange, label, description, disabled = false, id }: ToggleProps) {
  const autoId = useId();
  const toggleId = id ?? `toggle-${autoId}`;
  const descriptionId = `${toggleId}-description`;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="grid gap-0.5">
        <label htmlFor={toggleId} className="font-bold">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="type-caption text-ink-2">
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-8 w-14 shrink-0 rounded-pill border border-line transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
          checked ? "bg-mint" : "bg-surface-2",
        )}
      >
        <motion.span
          aria-hidden
          className="absolute top-[3px] left-[3px] h-6 w-6 rounded-full border border-carbon bg-paper"
          animate={{ x: checked ? 24 : 0 }}
          whileTap={{ scaleX: 1.25 }}
          transition={spring.release}
        />
      </button>
    </div>
  );
}
