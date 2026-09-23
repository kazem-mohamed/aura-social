import { useId, type ReactNode, type Ref } from "react";
import { cx } from "./cx";
import { FieldMessage } from "./FieldMessage";

interface RadioPillsProps {
  label: string;
  name: string;
  value: string | undefined;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  hint?: ReactNode;
  /** Attached to the first radio so forms can focus the group on error. */
  ref?: Ref<HTMLInputElement>;
}

/** A radio group drawn as pill stickers. Native radios keep arrow-key behaviour. */
export function RadioPills({ label, name, value, options, onChange, onBlur, error, hint, ref }: RadioPillsProps) {
  const messageId = `radios-${useId()}-message`;

  return (
    <fieldset className="grid gap-2" aria-describedby={error || hint ? messageId : undefined}>
      <legend className="mb-2 type-label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className={cx(
                "relative inline-flex h-11 cursor-pointer select-none items-center rounded-pill border border-line px-5 type-label transition-[background-color,color,scale] duration-200 active:scale-95",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-(--focus)",
                selected ? "bg-action text-action-ink" : "bg-surface text-ink hover:bg-surface-2",
              )}
            >
              <input
                ref={index === 0 ? ref : undefined}
                type="radio"
                className="sr-only"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
                aria-invalid={error ? true : undefined}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      <FieldMessage id={messageId} error={error} hint={hint} />
    </fieldset>
  );
}
