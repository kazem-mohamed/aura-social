import type { ReactNode } from "react";
import { Sticker } from "@/shared/brand/Sticker";

interface FieldMessageProps {
  id: string;
  error?: string;
  hint?: ReactNode;
}

/** The line under a control: an error (announced) or a hint. */
export function FieldMessage({ id, error, hint }: FieldMessageProps) {
  if (error) {
    return (
      <p id={id} role="alert" className="flex items-start gap-2 type-caption text-ink">
        <Sticker name="cross" fill="var(--ember)" size={16} className="mt-0.5 shrink-0" />
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={id} className="type-caption text-ink-2">
        {hint}
      </p>
    );
  }
  return null;
}
