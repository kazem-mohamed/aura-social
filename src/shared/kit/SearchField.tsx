import { Glyph } from "@/shared/brand/Glyph";
import { Field, type FieldProps } from "./Field";

interface SearchFieldProps extends Omit<FieldProps, "value" | "onChange" | "type" | "iconStart" | "action" | "label"> {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
}

/** Search input: magnifier, clear button, Escape clears, optional loading. */
export function SearchField({ value, onValueChange, label = "Search", ...props }: SearchFieldProps) {
  return (
    <Field
      {...props}
      label={label}
      type="search"
      iconStart="search"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && value) {
          event.preventDefault();
          onValueChange("");
        }
      }}
      action={
        value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onValueChange("")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Glyph name="close" size={18} />
          </button>
        ) : null
      }
    />
  );
}
