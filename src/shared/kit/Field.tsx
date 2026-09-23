import { AnimatePresence, motion } from "framer-motion";
import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { PeelLoader } from "@/shared/brand/PeelLoader";
import { Sticker } from "@/shared/brand/Sticker";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";
import { FieldMessage } from "./FieldMessage";
import { useShake } from "./useShake";

export interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: ReactNode;
  error?: string;
  /** Shows the mint tick once the value is known good. */
  success?: boolean;
  /** Async check in flight (e.g. a search). */
  loading?: boolean;
  iconStart?: GlyphName;
  /** A trailing control inside the field, such as show-password. */
  action?: ReactNode;
  counter?: { value: number; max: number };
  /** Focus ring colour — the person's identity colour when known. */
  ringColor?: string;
  hideLabel?: boolean;
  ref?: Ref<HTMLInputElement>;
}

/**
 * The branded text input — spec §7. Pill-shaped, black edge, focus ring in
 * the person's own colour, shake on a new error, tick on success.
 */
export function Field({
  label,
  hint,
  error,
  success = false,
  loading = false,
  iconStart,
  action,
  counter,
  ringColor,
  hideLabel = false,
  id,
  className,
  disabled,
  ref,
  ...input
}: FieldProps) {
  const autoId = useId();
  const inputId = id ?? `field-${autoId}`;
  const messageId = `${inputId}-message`;
  const shake = useShake<HTMLDivElement>(error);

  return (
    <div className={cx("grid gap-2", className)}>
      <label htmlFor={inputId} className={cx("type-label", hideLabel && "sr-only")}>
        {label}
      </label>
      <div
        ref={shake}
        className="field-box"
        data-invalid={error ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={ringColor ? ({ "--field-ring": ringColor } as CSSProperties) : undefined}
      >
        {iconStart ? <Glyph name={iconStart} size={20} className="shrink-0 text-ink-2" /> : null}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...input}
        />
        {counter ? (
          <span className={cx("shrink-0 type-caption tnum", counter.value > counter.max * 0.9 ? "text-ink" : "text-ink-3")}>
            {counter.value}/{counter.max}
          </span>
        ) : null}
        {loading ? <PeelLoader size={22} label="Checking" className="shrink-0" /> : null}
        <AnimatePresence initial={false}>
          {success && !loading ? (
            <motion.span
              key="ok"
              className="shrink-0"
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={spring.release}
            >
              <Sticker name="check" fill="var(--mint)" size={22} title="Looks good" />
            </motion.span>
          ) : null}
        </AnimatePresence>
        {action}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}
