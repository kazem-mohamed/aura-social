import { motion } from "framer-motion";
import { useRef, type KeyboardEvent } from "react";
import { useSafeId } from "@/shared/lib/useSafeId";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";
import { tabId, tabPanelId } from "./tabIds";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name of the group. */
  label: string;
  /** `radio` for filters (feed rooms), `tabs` when it switches panels. */
  semantics?: "radio" | "tabs";
  /** Id prefix for tab/panel pairs (tabs only). */
  idBase?: string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A pill group whose selected state is an ink sticker that slides between
 * options. Arrow keys, Home and End move the selection (roving tab index).
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  semantics = "radio",
  idBase,
  size = "md",
  className,
}: SegmentedProps<T>) {
  const groupId = useSafeId("segmented");
  const base = idBase ?? groupId;
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const isTabs = semantics === "tabs";

  const moveTo = (index: number) => {
    const next = (index + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keys: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowDown: index + 1,
      ArrowLeft: index - 1,
      ArrowUp: index - 1,
      Home: 0,
      End: options.length - 1,
    };
    if (event.key in keys) {
      event.preventDefault();
      moveTo(keys[event.key]);
    }
  };

  return (
    <div
      role={isTabs ? "tablist" : "radiogroup"}
      aria-label={label}
      className={cx(
        // Tighter on phones so four rooms fit a 343px column without scrolling; the scroll stays as a fallback.
        "inline-flex max-w-full gap-0.5 overflow-x-auto rounded-pill border border-line bg-surface p-1 [scrollbar-width:none] sm:gap-1",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role={isTabs ? "tab" : "radio"}
            id={isTabs ? tabId(base, option.value) : undefined}
            aria-controls={isTabs ? tabPanelId(base, option.value) : undefined}
            aria-selected={isTabs ? selected : undefined}
            aria-checked={isTabs ? undefined : selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cx(
              "relative isolate inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3 type-label transition-colors duration-200 sm:px-4",
              // The ::after grows the touch target to 44px vertically (neighbours sit side by side). It stays
              // inside the group's 4px padding, which a scroll container would clip anything past — so `sm`
              // draws at 36px, like an `sm` button, and `md` at 40px.
              "after:absolute after:inset-x-0 after:content-['']",
              size === "sm" ? "h-9 after:-inset-y-1" : "h-10 after:-inset-y-0.5",
              selected ? "text-action-ink" : "text-ink hover:bg-surface-2",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`${groupId}-selected`}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-pill bg-action"
                transition={spring.release}
              />
            ) : null}
            {option.label}
            {option.count !== undefined ? <span className="tnum opacity-70">{option.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/** Segmented control with tab semantics. Pair each panel with `tabPanelId(idBase, value)`. */
export function Tabs<T extends string>(props: Omit<SegmentedProps<T>, "semantics"> & { idBase: string }) {
  return <Segmented {...props} semantics="tabs" />;
}
