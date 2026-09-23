import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ComponentType, type KeyboardEvent, type Ref } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { useOutsideClick } from "@/shared/hooks/useOutsideClick";
import { useSafeId } from "@/shared/lib/useSafeId";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";
import { IconButton } from "./IconButton";

export interface MenuItem {
  label: string;
  glyph?: GlyphName;
  onSelect: () => void;
  tone?: "default" | "danger";
  disabled?: boolean;
}

export interface MenuTriggerProps {
  ref: Ref<HTMLButtonElement>;
  /** The menu's accessible name, for triggers without visible text. */
  label: string;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
}

/** Default trigger: a ghost "more" icon button. */
function MoreTrigger(props: MenuTriggerProps) {
  return <IconButton glyph="more" variant="ghost" size="sm" {...props} />;
}

interface MenuProps {
  /** Accessible name of the trigger and the menu. */
  label: string;
  items: MenuItem[];
  /** Custom trigger component; it must spread the props onto a <button>. Defaults to a "more" icon button. */
  trigger?: ComponentType<MenuTriggerProps>;
  align?: "start" | "end";
  side?: "bottom" | "top";
  className?: string;
}

/**
 * Menu button (WAI-ARIA menu pattern): arrows, Home/End, type-ahead, Escape
 * returns focus to the trigger, Tab and outside clicks close it.
 */
export function Menu({ label, items, trigger, align = "end", side = "bottom", className }: MenuProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useSafeId("menu");

  const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]));

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };
  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };
  const step = (direction: 1 | -1) => {
    const position = enabled.indexOf(active);
    setActive(enabled[(position + direction + enabled.length) % enabled.length]);
  };

  useOutsideClick(rootRef, () => close(false), open);

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt(enabled[0] ?? 0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(enabled[enabled.length - 1] ?? 0);
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(enabled[0]);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(enabled[enabled.length - 1]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    } else if (event.key === "Tab") {
      close(false);
    } else if (event.key.length === 1 && /\S/.test(event.key)) {
      const letter = event.key.toLowerCase();
      const position = enabled.indexOf(active);
      const order = [...enabled.slice(position + 1), ...enabled.slice(0, position + 1)];
      const hit = order.find((index) => items[index].label.toLowerCase().startsWith(letter));
      if (hit !== undefined) setActive(hit);
    }
  };

  const Trigger = trigger ?? MoreTrigger;

  return (
    <div ref={rootRef} className={cx("relative inline-flex", className)}>
      <Trigger
        ref={triggerRef}
        label={label}
        onClick={() => (open ? close(true) : openAt(enabled[0] ?? 0))}
        onKeyDown={onTriggerKeyDown}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
      />
      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={onMenuKeyDown}
            initial={{ opacity: 0, scale: 0.9, rotate: align === "end" ? -2 : 2, y: side === "bottom" ? -6 : 6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
            transition={spring.release}
            style={{ transformOrigin: `${side === "bottom" ? "top" : "bottom"} ${align === "end" ? "right" : "left"}` }}
            className={cx(
              "absolute z-(--z-overlay) grid min-w-52 gap-0.5 rounded-card border border-line bg-surface p-1.5 text-ink",
              side === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {items.map((item, index) => (
              <button
                key={item.label}
                ref={(el) => {
                  itemRefs.current[index] = el;
                }}
                type="button"
                role="menuitem"
                tabIndex={-1}
                disabled={item.disabled}
                onClick={() => {
                  close(true);
                  item.onSelect();
                }}
                onPointerEnter={() => {
                  if (!item.disabled) setActive(index);
                }}
                className={cx(
                  "flex h-11 items-center gap-3 rounded-chip px-3.5 text-left text-[15px] font-semibold outline-none transition-colors disabled:opacity-40",
                  item.tone === "danger" ? "focus:bg-ember focus:text-carbon" : "focus:bg-surface-2",
                )}
              >
                {item.glyph ? <Glyph name={item.glyph} size={18} /> : null}
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
