import { Glyph } from "@/shared/brand/Glyph";
import { cx } from "./cx";

interface RuleListProps {
  rules: { label: string; met: boolean }[];
  label?: string;
}

/** Live checklist of requirements — each rule turns into a mint sticker when met. */
export function RuleList({ rules, label = "Password requirements" }: RuleListProps) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5">
      {rules.map((rule) => (
        <li
          key={rule.label}
          className={cx(
            "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 type-caption transition-colors duration-200",
            rule.met ? "border-carbon bg-mint text-carbon" : "border-line text-ink-2",
          )}
        >
          <span aria-hidden className="grid h-3.5 w-3.5 place-items-center">
            {rule.met ? <Glyph name="check" size={14} strokeWidth={2.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          {rule.label}
          <span className="sr-only">{rule.met ? " — done" : " — not yet"}</span>
        </li>
      ))}
    </ul>
  );
}
