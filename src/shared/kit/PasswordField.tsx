import { useState } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { Field, type FieldProps } from "./Field";

/** Password input with a show/hide toggle inside the field. */
export function PasswordField({ autoComplete = "current-password", ...props }: Omit<FieldProps, "type" | "action">) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      autoComplete={autoComplete}
      action={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <Glyph name={visible ? "eye-off" : "eye"} size={20} />
        </button>
      }
    />
  );
}
