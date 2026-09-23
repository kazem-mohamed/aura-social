import { useId, useLayoutEffect, useMemo, useRef, type ReactNode, type Ref, type TextareaHTMLAttributes } from "react";
import { cx } from "./cx";
import { FieldMessage } from "./FieldMessage";
import { mergeRefs } from "./refs";
import { useShake } from "./useShake";

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
  hideLabel?: boolean;
  /** `always` shows the count; `near` only from 80% of `maxLength` (long-form composers). */
  counter?: "always" | "near";
  ref?: Ref<HTMLTextAreaElement>;
}

/** Auto-growing text area; the counter becomes a Sunburst sticker at 90% of the limit. */
export function TextArea({
  label,
  hint,
  error,
  hideLabel = false,
  counter = "always",
  id,
  className,
  maxLength,
  value,
  onInput,
  ref,
  ...rest
}: TextAreaProps) {
  const autoId = useId();
  const areaId = id ?? `area-${autoId}`;
  const messageId = `${areaId}-message`;
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const setRef = useMemo(() => mergeRefs(innerRef, ref), [ref]);
  const shake = useShake<HTMLDivElement>(error);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const length = typeof value === "string" ? value.length : 0;
  const nearLimit = maxLength !== undefined && length >= maxLength * 0.9;

  return (
    <div className={cx("grid gap-2", className)}>
      <label htmlFor={areaId} className={cx("type-label", hideLabel && "sr-only")}>
        {label}
      </label>
      <div ref={shake} className="field-box" data-multiline="" data-invalid={error ? "" : undefined}>
        <textarea
          ref={setRef}
          id={areaId}
          rows={3}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          onInput={(event) => {
            const el = event.currentTarget;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
            onInput?.(event);
          }}
          {...rest}
        />
        {maxLength !== undefined && (counter === "always" || length >= maxLength * 0.8) ? (
          <span
            className={cx(
              "mb-1 shrink-0 rounded-pill border px-2 py-0.5 type-caption tnum transition-colors duration-200",
              nearLimit ? "border-carbon bg-sun text-carbon" : "border-transparent text-ink-3",
            )}
          >
            {length}/{maxLength}
          </span>
        ) : null}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}
