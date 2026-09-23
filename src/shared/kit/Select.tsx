import { useId, type ReactNode, type Ref, type SelectHTMLAttributes } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { cx } from "./cx";
import { FieldMessage } from "./FieldMessage";
import { useShake } from "./useShake";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  hideLabel?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

/** Native select (full keyboard and screen-reader support) in the branded field. */
export function Select({ label, options, placeholder, hint, error, hideLabel = false, id, className, disabled, ref, ...rest }: SelectProps) {
  const autoId = useId();
  const selectId = id ?? `select-${autoId}`;
  const messageId = `${selectId}-message`;
  const shake = useShake<HTMLDivElement>(error);

  return (
    <div className={cx("grid gap-2", className)}>
      <label htmlFor={selectId} className={cx("type-label", hideLabel && "sr-only")}>
        {label}
      </label>
      <div ref={shake} className="field-box" data-invalid={error ? "" : undefined} data-disabled={disabled ? "" : undefined}>
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          {...rest}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Glyph name="chevron-down" size={20} className="pointer-events-none shrink-0 text-ink-2" />
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </div>
  );
}
