# Aura Rebrand — Phase 1: Core Components · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Aura's custom component system (spec §7) in `src/shared/kit/`, and show every component and state on the dev-only `/__kit` page. That covers buttons, the branded input system, selection controls, cards, avatars, modal/sheet, menu, tooltip, toasts, skeletons, empty/error states, the social action buttons, the rolling counter and the marquee.

**Architecture:**
- Components compose Phase 0's brand primitives (`Glyph`, `Sticker`, `PeelLoader`, `IdentitySticker`, `ObjectArt`) and motion primitives (`spring`, `useMotionPrefs`).
- State-dependent styling (field states, skeleton breathing, marquee, follow peel) lives in `src/styles/kit.css`; everything else is Tailwind utilities on the Phase 0 tokens.
- Nothing in `src/features` or `src/pages` (except `pages/kit`) changes. Pages adopt the kit in Phase 3.

**Tech Stack:** React 19, TypeScript 6, Tailwind v4, framer-motion 12 (`motion`, `AnimatePresence`, `useAnimate`, `useDragControls`, layout animations), React Router 7 (`Link`), `react-dom` portals.

**Spec:** `docs/superpowers/specs/2026-09-23-aura-sticker-rebrand-design.md` (§6 motion, §7 components). **Depends on:** Phase 0 plan (`2026-09-23-phase-0-foundation.md`), completed.

## Global Constraints

- No shadows and no gradients. Outline 1px `--line`; radius `rounded-pill` for controls, `rounded-card` / `rounded-card-lg` for surfaces.
- Text is always ink. Sticker colours are fills. Text on a sticker fill is `text-carbon`, except white on violet.
- **Never put Tailwind `translate-*` / `-translate-*` utilities on an element that Motion animates**: Motion writes `transform` inline and would erase them. Centre with a non-animated wrapper or negative margins instead.
- Everything animated honours reduced motion: `MotionConfig reducedMotion="user"` covers Motion transform/layout animations; `useMotionPrefs()` guards imperative animations (`useAnimate`), bursts and loops; CSS keyframes stop via the `prefers-reduced-motion` media query.
- `.tsx` files export components only. Constants, helpers, contexts and hooks go in `.ts` files.
- Keyboard: every interactive element is reachable, has a visible focus state, and follows its WAI-ARIA pattern (menu, tabs, radio group, switch, dialog).
- Touch targets ≥ 44px for primary controls (`md` sizes); `sm` sizes (36px) are for dense rows only.
- No test framework. Verification = `npm run typecheck`, `npx eslint src/shared/kit src/pages/kit`, and a browser check of `/__kit` at 375 / 768 / 1280 / 1440 in Paper and Night. When the preview pane is hidden, `requestAnimationFrame` is paused, so verify states through the DOM and look at motion with the pane visible.
- Materialise files with `node ../brand-lab/tools/extract-plan.cjs docs/superpowers/plans/2026-09-23-phase-1-components.md <task>`.

---

### Task 1.1: Kit styles, class helpers, buttons

**Files:**
- Create: `src/styles/kit.css`, `src/shared/kit/cx.ts`, `src/shared/kit/refs.ts`, `src/shared/kit/buttonStyles.ts`, `src/shared/kit/Button.tsx`, `src/shared/kit/ButtonLink.tsx`, `src/shared/kit/IconButton.tsx`
- Modify: `src/index.css` (import `kit.css` after `base.css`)

**Interfaces:**
- Produces:
  - `cx(...parts) → string`; `mergeRefs<T>(...refs) → RefCallback<T>`
  - `buttonClasses({ variant?, size?, fill? }) → string`; `type ButtonVariant = "primary" | "secondary" | "ghost" | "sticker" | "destructive" | "link"`; `type ButtonSize = "sm" | "md" | "lg"`; `type StickerFill = "sun" | "mint" | "lavender" | "violet"`
  - `<Button variant? size? fill? loading? success? iconStart? iconEnd? fullWidth? …buttonProps>`
  - `<ButtonLink to variant? size? fill? iconEnd? …linkProps>`
  - `<IconButton glyph label variant?("primary"|"secondary"|"ghost") size?("sm"|"md"|"lg") badge? …buttonProps>`

- [ ] **Step 1: Kit stylesheet**

**File:** `src/styles/kit.css`

```css
/* Kit component styles that depend on state selectors — spec §7. */

/* ── the branded input system ─────────────────────────────────── */
.field-box {
  --field-ring: var(--focus);
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 52px;
  padding-inline: 18px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink);
  outline: 3px solid transparent;
  outline-offset: 3px;
  transition:
    background-color var(--dur-quick) ease,
    outline-color var(--dur-quick) ease;
}
.field-box:hover {
  background: var(--surface-2);
}
.field-box:focus-within {
  outline-color: var(--field-ring);
}
.field-box[data-invalid] {
  outline-color: var(--ember);
}
.field-box[data-disabled] {
  opacity: 0.5;
  background: var(--band-mist);
}
.field-box[data-multiline] {
  align-items: flex-end;
  border-radius: 24px;
  padding-block: 10px;
}
.field-box :is(input, textarea, select) {
  flex: 1 1 auto;
  width: 0;
  min-width: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.35;
  padding-block: 13px;
}
.field-box :is(input, textarea, select):focus-visible {
  outline: none;
}
.field-box :is(input, textarea)::placeholder {
  color: var(--ink-3);
  opacity: 1;
}
.field-box textarea {
  align-self: stretch;
  min-height: 76px;
  padding-block: 4px;
  resize: none;
}
.field-box select {
  appearance: none;
  cursor: pointer;
}

/* ── skeletons breathe; they never shimmer ────────────────────── */
.kit-skeleton {
  background: var(--band-mist);
  animation: kit-breathe 1.8s ease-in-out infinite;
}
@keyframes kit-breathe {
  50% {
    opacity: 0.45;
    transform: scale(0.985);
  }
}

/* ── marquee ──────────────────────────────────────────────────── */
.kit-marquee-track {
  animation: kit-marquee var(--marquee-duration, 40s) linear infinite;
}
.kit-marquee:hover .kit-marquee-track {
  animation-play-state: paused;
}
@keyframes kit-marquee {
  to {
    transform: translateX(-50%);
  }
}

/* ── follow: the ink layer peels away diagonally ──────────────── */
.kit-follow-top {
  clip-path: polygon(0 0, 130% 0, 100% 100%, 0 100%);
  transition: clip-path var(--dur-peel) var(--ease-out-css);
}
.kit-follow[aria-pressed="true"] .kit-follow-top {
  clip-path: polygon(0 0, 0 0, -30% 100%, 0 100%);
}

@media (prefers-reduced-motion: reduce) {
  .kit-skeleton,
  .kit-marquee-track {
    animation: none;
  }
}
```

**File:** `src/index.css`

```css
@import "tailwindcss";
@import "@fontsource-variable/anybody/standard.css";
@import "@fontsource-variable/onest/index.css";
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/kit.css";
@import "./styles/legacy.css";
```

- [ ] **Step 2: Helpers**

**File:** `src/shared/kit/cx.ts`

```ts
/** Joins class names, skipping falsy parts. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
```

**File:** `src/shared/kit/refs.ts`

```ts
import type { Ref, RefCallback } from "react";

/** Points several refs at the same node. */
export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  };
}
```

**File:** `src/shared/kit/buttonStyles.ts`

```ts
export type ButtonVariant = "primary" | "secondary" | "ghost" | "sticker" | "destructive" | "link";
export type ButtonSize = "sm" | "md" | "lg";
/** Fills allowed on the `sticker` variant. Never blue — Electric Blue is not an action colour. */
export type StickerFill = "sun" | "mint" | "lavender" | "violet";

const BASE =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-pill border font-bold uppercase tracking-[0.032em] transition-[background-color,color,border-color,opacity,translate,rotate,scale] disabled:cursor-not-allowed disabled:opacity-45";

/** A 36px `sm` pill still gets a 44px touch target: an invisible `::after` reaches 4px past each edge. */
const HIT_44 = "after:absolute after:-inset-1 after:content-['']";

const SIZES: Record<ButtonSize, string> = {
  sm: `h-9 px-3.5 text-[11px] ${HIT_44}`,
  md: "h-11 px-5 text-[13px]",
  lg: "h-14 px-7 text-[15px]",
};

const VARIANTS: Record<Exclude<ButtonVariant, "sticker">, string> = {
  primary: "border-action bg-action text-action-ink",
  secondary: "border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "border-transparent bg-transparent text-ink hover:bg-surface-2",
  destructive: "border-carbon bg-ember text-carbon",
  link: "h-auto border-transparent px-0 normal-case tracking-normal underline decoration-1 underline-offset-4",
};

const FILLS: Record<StickerFill, string> = {
  sun: "bg-sun text-carbon",
  mint: "bg-mint text-carbon",
  lavender: "bg-lavender text-carbon",
  violet: "bg-violet text-paper",
};

/** Class string shared by `Button` and `ButtonLink`. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fill = "sun",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fill?: StickerFill;
}): string {
  const tone = variant === "sticker" ? `border-carbon ${FILLS[fill]}` : VARIANTS[variant];
  return `${BASE} ${variant === "link" ? "" : SIZES[size]} ${tone}`;
}
```

- [ ] **Step 3: Button**

**File:** `src/shared/kit/Button.tsx`

```tsx
import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { PeelLoader } from "@/shared/brand/PeelLoader";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { buttonClasses, type ButtonSize, type ButtonVariant, type StickerFill } from "./buttonStyles";
import { cx } from "./cx";

const ICON_SIZE = { sm: 16, md: 18, lg: 20 } as const;

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Fill for the `sticker` variant — landing CTAs only. */
  fill?: StickerFill;
  /** Replaces the label with the peel loader and blocks presses; the width stays put. */
  loading?: boolean;
  /** Swaps the leading icon for a tick after a successful action. */
  success?: boolean;
  iconStart?: GlyphName;
  iconEnd?: GlyphName;
  fullWidth?: boolean;
  children: ReactNode;
}

/** Sticker-physics button: lifts and tilts on hover, squishes on press, springs back. */
export function Button({
  variant = "primary",
  size = "md",
  fill = "sun",
  loading = false,
  success = false,
  iconStart,
  iconEnd,
  fullWidth = false,
  disabled,
  type = "button",
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const { reduced } = useMotionPrefs();
  const lively = !reduced && !disabled && !loading && variant !== "link";
  const icon = ICON_SIZE[size];

  return (
    <motion.button
      type={type}
      // Loading blocks presses without `disabled`, which would drop the focus
      // of whoever just pressed it to the page. A cancelled click also stops
      // a submit, from the button or from Enter in a field.
      disabled={disabled}
      aria-disabled={loading || undefined}
      aria-busy={loading || undefined}
      className={cx(buttonClasses({ variant, size, fill }), fullWidth && "w-full", className)}
      whileHover={lively ? { y: -2, rotate: -1.5 } : undefined}
      whileTap={lively ? { scale: 0.94, transition: spring.press } : undefined}
      transition={spring.release}
      {...rest}
      onClick={loading ? (event) => event.preventDefault() : onClick}
    >
      <span className={cx("inline-flex items-center gap-2", loading && "invisible")}>
        {success ? (
          <Glyph name="check" size={icon} strokeWidth={2.5} />
        ) : iconStart ? (
          <Glyph name={iconStart} size={icon} />
        ) : null}
        {children}
        {iconEnd ? <Glyph name={iconEnd} size={icon} /> : null}
      </span>
      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <PeelLoader size={icon + 8} label="Working" />
        </span>
      ) : null}
    </motion.button>
  );
}
```

**File:** `src/shared/kit/ButtonLink.tsx`

```tsx
import { Link, type LinkProps } from "react-router";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { buttonClasses, type ButtonSize, type ButtonVariant, type StickerFill } from "./buttonStyles";
import { cx } from "./cx";

export interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fill?: StickerFill;
  iconEnd?: GlyphName;
}

/** A router link dressed as a button — same variants, CSS-only lift and press. */
export function ButtonLink({ variant = "primary", size = "md", fill = "sun", iconEnd, className, children, ...rest }: ButtonLinkProps) {
  return (
    <Link
      className={cx(
        buttonClasses({ variant, size, fill }),
        "duration-300 ease-spring hover:-translate-y-0.5 hover:-rotate-[1.5deg] active:scale-95 active:duration-75",
        className,
      )}
      {...rest}
    >
      {children}
      {iconEnd ? <Glyph name={iconEnd} size={size === "lg" ? 20 : 18} /> : null}
    </Link>
  );
}
```

**File:** `src/shared/kit/IconButton.tsx`

```tsx
import { motion, type HTMLMotionProps } from "framer-motion";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";

/** `sm` draws at 36px but its invisible `::after` makes the touch target 44px. */
const DIMENSIONS = { sm: "h-9 w-9 after:absolute after:-inset-1 after:content-['']", md: "h-11 w-11", lg: "h-13 w-13" } as const;
const TONES = {
  primary: "border-action bg-action text-action-ink",
  secondary: "border-line bg-surface text-ink hover:bg-surface-2",
  ghost: "border-transparent bg-transparent text-ink hover:bg-surface-2",
} as const;

export interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children" | "aria-label"> {
  glyph: GlyphName;
  /** Accessible name — required, since there is no visible text. */
  label: string;
  variant?: keyof typeof TONES;
  size?: keyof typeof DIMENSIONS;
  /** Unread-style count sticker in the corner. */
  badge?: number;
}

export function IconButton({ glyph, label, variant = "secondary", size = "md", badge, disabled, type = "button", className, ...rest }: IconButtonProps) {
  const { reduced } = useMotionPrefs();
  const lively = !reduced && !disabled;

  return (
    <motion.button
      type={type}
      aria-label={badge ? `${label}, ${badge} new` : label}
      disabled={disabled}
      className={cx(
        "relative grid shrink-0 place-items-center rounded-full border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        DIMENSIONS[size],
        TONES[variant],
        className,
      )}
      whileHover={lively ? { rotate: -6, y: -1 } : undefined}
      whileTap={lively ? { scale: 0.9, transition: spring.press } : undefined}
      transition={spring.release}
      {...rest}
    >
      <Glyph name={glyph} size={size === "sm" ? 18 : 20} />
      {badge ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-pill border border-carbon bg-ember px-1 text-[10px] font-bold text-carbon tnum"
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </motion.button>
  );
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/styles/kit.css src/index.css src/shared/kit
git commit -m "Add kit styles, button, button link and icon button"
```

---

### Task 1.2: The branded input system

**Files:**
- Create in `src/shared/kit/`: `useShake.ts`, `FieldMessage.tsx`, `Field.tsx`, `PasswordField.tsx`, `SearchField.tsx`, `RuleList.tsx`, `TextArea.tsx`, `Select.tsx`, `DateField.tsx`, `RadioPills.tsx`

**Interfaces:**
- Consumes: `cx`, `mergeRefs` (1.1); `Glyph`, `Sticker`, `PeelLoader` (Phase 0); `useMotionPrefs`.
- Produces:
  - `useShake<T extends Element>(message?: string) → AnimationScope<T>`
  - `<FieldMessage id error? hint? />`
  - `<Field label hint? error? success? loading? iconStart? action? counter?={value,max} ringColor? hideLabel? ref? …inputProps>`
  - `<PasswordField …Field props except type/action>`
  - `<SearchField value onValueChange label? loading? placeholder? …>`
  - `<RuleList rules={{label, met}[]} label? />`
  - `<TextArea label hint? error? hideLabel? maxLength? ref? …textareaProps>`
  - `<Select label options={{value,label}[]} placeholder? hint? error? hideLabel? ref? …selectProps>`
  - `<DateField …Field props except type/iconStart>`
  - `<RadioPills label name value options onChange onBlur? error? hint? ref? />`

- [ ] **Step 1: Shared pieces**

**File:** `src/shared/kit/useShake.ts`

```ts
import { useAnimate } from "framer-motion";
import { useEffect } from "react";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

/**
 * Shakes the returned element whenever `message` changes to a new non-empty
 * value — a field's error, typically. Nothing moves under reduced motion.
 */
export function useShake<T extends Element>(message: string | undefined) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<T>();

  useEffect(() => {
    if (!message || reduced || !scope.current) return;
    animate(scope.current, { x: [0, -6, 5, -3, 0] }, { duration: 0.38 });
  }, [message, reduced, animate, scope]);

  return scope;
}
```

**File:** `src/shared/kit/FieldMessage.tsx`

```tsx
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
```

- [ ] **Step 2: Field**

**File:** `src/shared/kit/Field.tsx`

```tsx
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
```

- [ ] **Step 3: Password, search, rules**

**File:** `src/shared/kit/PasswordField.tsx`

```tsx
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
```

**File:** `src/shared/kit/SearchField.tsx`

```tsx
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
```

**File:** `src/shared/kit/RuleList.tsx`

```tsx
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
```

- [ ] **Step 4: TextArea, Select, DateField, RadioPills**

**File:** `src/shared/kit/TextArea.tsx`

```tsx
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
  ref?: Ref<HTMLTextAreaElement>;
}

/** Auto-growing text area; the counter becomes a Sunburst sticker at 90% of the limit. */
export function TextArea({ label, hint, error, hideLabel = false, id, className, maxLength, value, onInput, ref, ...rest }: TextAreaProps) {
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
        {maxLength !== undefined ? (
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
```

**File:** `src/shared/kit/Select.tsx`

```tsx
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
```

**File:** `src/shared/kit/DateField.tsx`

```tsx
import { Field, type FieldProps } from "./Field";

/** Native date input in the branded field, with a calendar glyph. */
export function DateField(props: Omit<FieldProps, "type" | "iconStart">) {
  return <Field {...props} type="date" iconStart="calendar" />;
}
```

**File:** `src/shared/kit/RadioPills.tsx`

```tsx
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
```

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit
git commit -m "Add the branded input system: field, password, search, text area, select, date, radio pills"
```

---

### Task 1.3: Toggle, segmented control and tabs

**Files:**
- Create: `src/shared/kit/Toggle.tsx`, `src/shared/kit/tabIds.ts`, `src/shared/kit/Segmented.tsx`

**Interfaces:**
- Produces:
  - `<Toggle checked onChange label description? disabled? id? />`
  - `<Segmented<T> options={{value,label,count?}[]} value onChange label semantics?("radio"|"tabs") idBase? size?("sm"|"md") className? />`
  - `<Tabs<T> … idBase />` (Segmented with tab semantics)
  - `tabId(base, value)`, `tabPanelId(base, value)`

- [ ] **Step 1: Toggle**

**File:** `src/shared/kit/Toggle.tsx`

```tsx
import { motion } from "framer-motion";
import { useId } from "react";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

/** A switch: the knob is a paper sticker that squishes as it slides. */
export function Toggle({ checked, onChange, label, description, disabled = false, id }: ToggleProps) {
  const autoId = useId();
  const toggleId = id ?? `toggle-${autoId}`;
  const descriptionId = `${toggleId}-description`;

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="grid gap-0.5">
        <label htmlFor={toggleId} className="font-bold">
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="type-caption text-ink-2">
            {description}
          </p>
        ) : null}
      </div>
      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-8 w-14 shrink-0 rounded-pill border border-line transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
          checked ? "bg-mint" : "bg-surface-2",
        )}
      >
        <motion.span
          aria-hidden
          className="absolute top-[3px] left-[3px] h-6 w-6 rounded-full border border-carbon bg-paper"
          animate={{ x: checked ? 24 : 0 }}
          whileTap={{ scaleX: 1.25 }}
          transition={spring.release}
        />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Segmented and tabs**

**File:** `src/shared/kit/tabIds.ts`

```ts
/** Id of a tab button in a `Tabs` group. */
export const tabId = (base: string, value: string): string => `${base}-tab-${value}`;

/** Id of the panel a tab controls — put it on the `role="tabpanel"` element. */
export const tabPanelId = (base: string, value: string): string => `${base}-panel-${value}`;
```

**File:** `src/shared/kit/Segmented.tsx`

```tsx
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
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit
git commit -m "Add toggle, segmented control and tabs"
```

---

### Task 1.4: Card and Avatar

**Files:**
- Create: `src/shared/kit/Card.tsx`, `src/shared/kit/Avatar.tsx`

**Interfaces:**
- Produces:
  - `<Card variant?("default"|"interactive"|"featured"|"compact"|"media"|"profile"|"content") band?("sky"|"lav"|"sun"|"mint"|"concrete") …motion.article props>`
  - `<Avatar identityKey name photo? size?("sm"|"md"|"lg"|"xl") frame? label? className? />`

- [ ] **Step 1: Card**

**File:** `src/shared/kit/Card.tsx`

```tsx
import { motion, type HTMLMotionProps } from "framer-motion";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";

type CardVariant = "default" | "interactive" | "featured" | "compact" | "media" | "profile" | "content";
type Band = "sky" | "lav" | "sun" | "mint" | "concrete";

const PADDING: Record<CardVariant, string> = {
  default: "p-5 sm:p-6",
  interactive: "cursor-pointer p-5 sm:p-6",
  featured: "p-6 sm:p-8",
  compact: "p-3.5",
  media: "overflow-hidden p-0",
  profile: "grid justify-items-center gap-3 p-5 text-center sm:p-6",
  content: "p-5 type-body-lg sm:p-7",
};

const BANDS: Record<Band, string> = {
  sky: "bg-band-sky",
  lav: "bg-band-lav",
  sun: "bg-sun text-carbon",
  mint: "bg-mint text-carbon",
  concrete: "bg-band-concrete",
};

export interface CardProps extends HTMLMotionProps<"article"> {
  variant?: CardVariant;
  /** Colour band ground; `featured` defaults to Sky. */
  band?: Band;
}

/** A sticker-edged surface. `interactive` cards lift and tilt on hover and squish on press. */
export function Card({ variant = "default", band, className, ...rest }: CardProps) {
  const { reduced } = useMotionPrefs();
  const lively = variant === "interactive" && !reduced;
  const ground = band ? BANDS[band] : variant === "featured" ? BANDS.sky : "bg-surface";

  return (
    <motion.article
      className={cx("relative rounded-card border border-line", ground, PADDING[variant], className)}
      whileHover={lively ? { y: -3, rotate: -0.6 } : undefined}
      whileTap={lively ? { scale: 0.985 } : undefined}
      transition={spring.release}
      {...rest}
    />
  );
}
```

- [ ] **Step 2: Avatar**

**File:** `src/shared/kit/Avatar.tsx`

```tsx
import { IdentitySticker } from "@/shared/brand/IdentitySticker";

const SIZES = { sm: 32, md: 40, lg: 64, xl: 128 } as const;

interface AvatarProps {
  /** Handle (preferred) or id. */
  identityKey: string;
  name: string;
  photo?: string | null;
  size?: keyof typeof SIZES;
  /** Identity frame behind the photo. */
  frame?: boolean;
  /** Accessible name; omit when the name is shown next to it. */
  label?: string;
  className?: string;
}

/** A person's photo inside their identity sticker. */
export function Avatar({ size = "md", ...props }: AvatarProps) {
  return <IdentitySticker size={SIZES[size]} {...props} />;
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit
git commit -m "Add card and avatar"
```

---

### Task 1.5: Modal, sheet and confirm dialog

**Files:**
- Create: `src/shared/kit/useFocusTrap.ts`, `src/shared/kit/Modal.tsx`, `src/shared/kit/ConfirmDialog.tsx`

**Interfaces:**
- Consumes: `IconButton` (1.1), `Button` (1.1), `useMediaQuery`, `useScrollLock`, `useSafeId` (Phase 0).
- Produces:
  - `useFocusTrap(ref, { initialFocus?, onEscape?, active? })`
  - `<Modal open onClose title description? children? footer? size?("sm"|"md"|"lg") hideTitle? initialFocus? dismissible? />` — a centred dialog at ≥640px and a draggable bottom sheet on phones
  - `<ConfirmDialog open onClose onConfirm title description? confirmLabel? cancelLabel? destructive? loading? />`

- [ ] **Step 1: Focus trap**

**File:** `src/shared/kit/useFocusTrap.ts`

```ts
import { useEffect, useRef, useState, type RefObject } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface FocusTrapOptions {
  initialFocus?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
  active?: boolean;
}

/**
 * Keeps Tab inside `ref` while active, focuses the first control (or
 * `initialFocus`) on open, closes on Escape, and returns focus to whatever
 * had it before.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, { initialFocus, onEscape, active = true }: FocusTrapOptions) {
  const escapeRef = useRef(onEscape);
  // Read on the first render: by the time effects run, a field inside may
  // already have taken focus with autoFocus, and that field isn't the opener.
  const [previous] = useState(() => (document.activeElement instanceof HTMLElement ? document.activeElement : null));
  const focusedOnOpen = useRef<HTMLElement | null>(null);

  useEffect(() => {
    escapeRef.current = onEscape;
  });

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.getClientRects().length > 0);

    // An explicit target wins; otherwise respect a field that already took
    // focus (autoFocus) — also on a re-run of this effect, after the cleanup
    // has handed focus back — and only fall back to the first control.
    const autoFocused = node.contains(document.activeElement) ? (document.activeElement as HTMLElement) : null;
    const remembered = focusedOnOpen.current && node.contains(focusedOnOpen.current) ? focusedOnOpen.current : null;
    const target = initialFocus?.current ?? autoFocused ?? remembered ?? focusables()[0] ?? node;
    focusedOnOpen.current = target;
    target.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && escapeRef.current) {
        event.stopPropagation();
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // What opened it may be gone (a deleted comment took its menu with it);
      // then focus lands on the page's main region rather than the document.
      const target = previous?.isConnected ? previous : document.getElementById("content");
      target?.focus({ preventScroll: true });
    };
  }, [active, ref, initialFocus, previous]);
}
```

- [ ] **Step 2: Modal**

**File:** `src/shared/kit/Modal.tsx`

```tsx
import { AnimatePresence, motion, useDragControls, useIsPresent } from "framer-motion";
import { useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useScrollLock } from "@/shared/hooks/useScrollLock";
import { useSafeId } from "@/shared/lib/useSafeId";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";
import { IconButton } from "./IconButton";
import { useFocusTrap } from "./useFocusTrap";

const WIDTH = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl" } as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof WIDTH;
  hideTitle?: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  /** When false: no close button, no backdrop or Escape dismissal, no drag. */
  dismissible?: boolean;
}

/**
 * Dialog on tablets and desktops — it slaps in from a tilt. Bottom sheet on
 * phones — it slides up and can be dragged down to dismiss by its handle.
 */
export function Modal({ open, ...panel }: ModalProps) {
  return createPortal(<AnimatePresence>{open ? <ModalPanel key="modal" {...panel} /> : null}</AnimatePresence>, document.body);
}

function ModalPanel({
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideTitle = false,
  initialFocus,
  dismissible = true,
}: Omit<ModalProps, "open">) {
  const isPhone = useMediaQuery("(max-width: 639px)");
  const { reduced } = useMotionPrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const titleId = useSafeId("modal-title");
  const descriptionId = useSafeId("modal-description");
  // While the exit animation plays the panel is no longer "present": release
  // the scroll lock and return focus at once instead of after the animation.
  const isPresent = useIsPresent();

  useScrollLock(isPresent);
  useFocusTrap(panelRef, { initialFocus, onEscape: dismissible ? onClose : undefined, active: isPresent });

  const entrance = isPhone
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : {
        initial: { opacity: 0, scale: 0.92, rotate: -2, y: 16 },
        animate: { opacity: 1, scale: 1, rotate: 0, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
      };

  return (
    <div
      className={cx(
        "fixed inset-0 z-(--z-modal) flex items-end justify-center sm:items-center sm:p-6",
        !isPresent && "pointer-events-none",
      )}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-(--scrim)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={dismissible ? onClose : undefined}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden border border-line bg-surface text-ink outline-none",
          "rounded-t-card-lg pb-[env(safe-area-inset-bottom)] sm:rounded-card-lg sm:pb-0",
          WIDTH[size],
        )}
        {...entrance}
        transition={reduced ? { duration: 0 } : spring.arrive}
        drag={isPhone && dismissible ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
      >
        {isPhone && dismissible ? (
          <div
            aria-hidden
            onPointerDown={(event) => dragControls.start(event)}
            className="grid h-7 shrink-0 cursor-grab touch-none place-items-center"
          >
            <span className="h-1.5 w-12 rounded-pill bg-ink-3" />
          </div>
        ) : null}
        <header className="flex items-start gap-4 px-6 pt-4 sm:px-8 sm:pt-7">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className={cx("type-heading-sm", hideTitle && "sr-only")}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1.5 type-body text-ink-2">
                {description}
              </p>
            ) : null}
          </div>
          {dismissible ? <IconButton glyph="close" label="Close" variant="ghost" size="sm" onClick={onClose} /> : null}
        </header>
        {children ? <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">{children}</div> : <div className="h-5" />}
        {footer ? <footer className="flex flex-wrap justify-end gap-2 px-6 pb-6 sm:px-8 sm:pb-7">{footer}</footer> : null}
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 3: Confirm dialog**

**File:** `src/shared/kit/ConfirmDialog.tsx`

```tsx
import { useRef } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ember confirm button for irreversible actions. */
  destructive?: boolean;
  loading?: boolean;
}

/** A two-button question. Focus starts on Cancel so Enter never destroys by accident. */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      initialFocus={cancelRef}
      footer={
        <>
          <Button ref={cancelRef} variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "destructive" : "primary"} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit
git commit -m "Add modal, bottom sheet and confirm dialog"
```

---

### Task 1.6: Menu and tooltip

**Files:**
- Create: `src/shared/kit/Menu.tsx`, `src/shared/kit/Tooltip.tsx`

**Interfaces:**
- Consumes: `IconButton` (1.1), `useOutsideClick` (`@/shared/hooks/useOutsideClick`), `useSafeId`.
- Produces:
  - `type MenuItem = { label; glyph?; onSelect; tone?("default"|"danger"); disabled? }`
  - `type MenuTriggerProps`
  - `<Menu label items trigger?={(props) => node} align?("start"|"end") side?("bottom"|"top") className? />`
  - `<Tooltip label side?("top"|"bottom") children={singleElement} />`

- [ ] **Step 1: Menu**

**File:** `src/shared/kit/Menu.tsx`

```tsx
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
```

- [ ] **Step 2: Tooltip**

**File:** `src/shared/kit/Tooltip.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { cloneElement, useEffect, useRef, useState, type ReactElement } from "react";
import { useSafeId } from "@/shared/lib/useSafeId";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";

interface TooltipProps {
  label: string;
  side?: "top" | "bottom";
  children: ReactElement<{ "aria-describedby"?: string }>;
}

/**
 * A Sunburst label sticker. Hover shows it after 400ms, keyboard focus
 * shows it at once, Escape hides it. The description is always available to
 * screen readers through a hidden element, not only while visible.
 */
export function Tooltip({ label, side = "top", children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const id = useSafeId("tooltip");

  const show = (delay: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setOpen(false);
  };

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <span
      className="relative inline-flex"
      onPointerEnter={() => show(400)}
      onPointerLeave={hide}
      onFocus={() => show(0)}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape") hide();
      }}
    >
      {cloneElement(children, { "aria-describedby": id })}
      <span id={id} className="sr-only">
        {label}
      </span>
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute left-1/2 z-(--z-toast) -translate-x-1/2",
          side === "top" ? "bottom-full mb-2" : "top-full mt-2",
        )}
      >
        <AnimatePresence>
          {open ? (
            <motion.span
              className="block whitespace-nowrap rounded-pill border border-carbon bg-sun px-3 py-1.5 type-label text-carbon"
              initial={{ opacity: 0, y: side === "top" ? 6 : -6, scale: 0.9, rotate: -3 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
              transition={spring.release}
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </span>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit
git commit -m "Add menu and tooltip"
```

---

### Task 1.7: Toasts

**Files:**
- Create: `src/shared/kit/toast/toastContext.ts`, `src/shared/kit/toast/useToast.ts`, `src/shared/kit/toast/ToastShelf.tsx`, `src/shared/kit/toast/ToastProvider.tsx`
- Modify (replace): `src/app/providers/AppProviders.tsx`

**Interfaces:**
- Produces:
  - `type ToastTone = "success" | "info" | "warning" | "error"`
  - `useToast() → { show(input: ToastInput): number; dismiss(id: number): void }` with `ToastInput = { tone?; title; description?; action?: { label; onClick }; duration? }`
  - `<ToastProvider>` mounted app-wide (next to the legacy provider until Phase 3)

- [ ] **Step 1: Context and hook**

**File:** `src/shared/kit/toast/toastContext.ts`

```ts
import { createContext } from "react";

export type ToastTone = "success" | "info" | "warning" | "error";

export interface ToastInput {
  tone?: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  /** Milliseconds before it lifts away. Defaults to 2400; errors to 5000. */
  duration?: number;
}

export interface ToastRecord {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration: number;
}

export interface ToastApi {
  show: (input: ToastInput) => number;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
```

**File:** `src/shared/kit/toast/useToast.ts`

```ts
import { useContext } from "react";
import { ToastContext, type ToastApi } from "./toastContext";

/** Raise a toast from anywhere under `<ToastProvider>`. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>.");
  return api;
}
```

- [ ] **Step 2: Shelf and provider**

**File:** `src/shared/kit/toast/ToastShelf.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { spring } from "@/shared/motion/tokens";
import { cx } from "../cx";
import type { ToastRecord, ToastTone } from "./toastContext";

const TONE_FILL: Record<ToastTone, string> = { success: "bg-mint", info: "bg-sky", warning: "bg-sun", error: "bg-ember" };
const TONE_ICON: Record<ToastTone, StickerName> = { success: "check", info: "info", warning: "bang", error: "cross" };

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [paused, toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      role={toast.tone === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: 26, rotate: -7, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.22, ease: "easeIn" } }}
      transition={spring.arrive}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={cx(
        "pointer-events-auto flex w-max max-w-[min(92vw,480px)] items-center gap-3 rounded-pill border border-carbon py-2 pr-2 pl-2 text-carbon",
        TONE_FILL[toast.tone],
      )}
    >
      <Sticker name={TONE_ICON[toast.tone]} fill="var(--paper)" size={28} className="shrink-0" />
      <div className="min-w-0 flex-1 pr-1">
        <p className="leading-tight font-bold">{toast.title}</p>
        {toast.description ? <p className="type-caption">{toast.description}</p> : null}
      </div>
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
          className="shrink-0 rounded-pill border border-carbon bg-paper px-3 py-1.5 type-label text-carbon"
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-carbon/10"
      >
        <Glyph name="close" size={16} />
      </button>
    </motion.div>
  );
}

/** Where toasts land: bottom-centre, above the dock, newest last. */
export function ToastShelf({ toasts, onDismiss }: { toasts: ToastRecord[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+104px)] z-(--z-toast) grid justify-items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
```

**File:** `src/shared/kit/toast/ToastProvider.tsx`

```tsx
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastApi, type ToastInput, type ToastRecord } from "./toastContext";
import { ToastShelf } from "./ToastShelf";

/** Holds up to three toasts; older ones leave as new ones arrive. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    const tone = input.tone ?? "success";
    setToasts((list) => [
      ...list.slice(-2),
      {
        id,
        tone,
        title: input.title,
        description: input.description,
        action: input.action,
        duration: input.duration ?? (tone === "error" ? 5000 : 2400),
      },
    ]);
    return id;
  }, []);

  const api = useMemo<ToastApi>(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastShelf toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 3: Mount the provider app-wide**

**File:** `src/app/providers/AppProviders.tsx`

```tsx
import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { ToastProvider } from "@/shared/kit/toast/ToastProvider";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { FetchRule } from "@/shared/ui/FetchRule";
import { ToastProvider as LegacyToastProvider } from "@/shared/ui/toast";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

/**
 * Provider stack for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation honour
 * `prefers-reduced-motion` by default; components still opt out of loops
 * through `useMotionPrefs()`.
 *
 * The legacy toast provider stays until Phase 3 moves every screen onto the
 * kit's toasts.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <LegacyToastProvider>
                <FetchRule />
                {children}
              </LegacyToastProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit src/app/providers` → no errors.

```bash
git add src/shared/kit/toast src/app/providers/AppProviders.tsx
git commit -m "Add sticker toasts and mount them app-wide"
```

---

### Task 1.8: Skeletons, empty and error states

**Files:**
- Create: `src/shared/kit/Skeleton.tsx`, `src/shared/kit/EmptyState.tsx`, `src/shared/kit/ErrorState.tsx`

**Interfaces:**
- Consumes: `ObjectArt`, `ObjectName` (Phase 0); `Button`, `ButtonLink` (1.1).
- Produces:
  - `<Skeleton shape?("line"|"circle"|"block") className? style? />`, `<PostSkeleton />`, `<ListSkeleton rows? label? />`
  - `<EmptyState object title body? action?={label, onClick?|to?} compact? titleAs?("h2"|"h3") className? />`
  - `<ErrorState level?("inline"|"section"|"page") title? message onRetry? retryLabel? className? />`

- [ ] **Step 1: Skeletons**

**File:** `src/shared/kit/Skeleton.tsx`

```tsx
import type { CSSProperties } from "react";
import { cx } from "./cx";

interface SkeletonProps {
  shape?: "line" | "circle" | "block";
  className?: string;
  style?: CSSProperties;
}

/** A placeholder that breathes (opacity + scale) — never a gradient shimmer. */
export function Skeleton({ shape = "line", className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden
      style={style}
      className={cx(
        "kit-skeleton block",
        shape === "circle" ? "rounded-full" : shape === "block" ? "rounded-card" : "h-3 rounded-pill",
        className,
      )}
    />
  );
}

/** The loading shape of one post card. */
export function PostSkeleton() {
  return (
    <div role="status" aria-label="Loading post" className="rounded-card border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" className="h-10 w-10" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="w-32" />
          <Skeleton className="w-20" />
        </div>
      </div>
      <div className="mt-5 grid gap-2.5">
        <Skeleton />
        <Skeleton className="w-11/12" />
        <Skeleton className="w-3/5" />
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

/** Rows of avatar + two lines — people, notifications, comments. */
export function ListSkeleton({ rows = 4, label = "Loading" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-4">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton shape="circle" className="h-11 w-11 shrink-0" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="w-2/5" />
            <Skeleton className="w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Empty state**

**File:** `src/shared/kit/EmptyState.tsx`

```tsx
import type { ObjectName } from "@/assets/objects/manifest";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { Button } from "./Button";
import { ButtonLink } from "./ButtonLink";
import { cx } from "./cx";

interface EmptyStateProps {
  /** A deflated object reads as "waiting for breath", not broken. */
  object: ObjectName;
  title: string;
  body?: string;
  action?: { label: string; onClick?: () => void; to?: string };
  compact?: boolean;
  titleAs?: "h2" | "h3";
  className?: string;
}

/** An invitation, not an apology: object, one line, one useful action. */
export function EmptyState({ object, title, body, action, compact = false, titleAs: Title = "h2", className }: EmptyStateProps) {
  return (
    <section className={cx("grid justify-items-center gap-3 px-6 text-center", compact ? "py-8" : "py-14", className)}>
      <div className={compact ? "w-28" : "w-44 sm:w-52"}>
        <ObjectArt name={object} sizes={compact ? "112px" : "208px"} />
      </div>
      <Title className="type-heading-sm text-balance">{title}</Title>
      {body ? <p className="max-w-[40ch] type-body text-ink-2">{body}</p> : null}
      {action ? (
        action.to ? (
          <ButtonLink to={action.to} className="mt-2">
            {action.label}
          </ButtonLink>
        ) : (
          <Button onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        )
      ) : null}
    </section>
  );
}
```

- [ ] **Step 3: Error state**

**File:** `src/shared/kit/ErrorState.tsx`

```tsx
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { Sticker } from "@/shared/brand/Sticker";
import { Button } from "./Button";
import { cx } from "./cx";

interface ErrorStateProps {
  level?: "inline" | "section" | "page";
  title?: string;
  /** What happened and what to do, in one or two plain sentences. */
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/** Human error with a way back — inline in a list, a section card, or a whole page. */
export function ErrorState({ level = "section", title, message, onRetry, retryLabel = "Try again", className }: ErrorStateProps) {
  if (level === "inline") {
    return (
      <p role="alert" className={cx("flex flex-wrap items-center gap-2 type-body", className)}>
        <Sticker name="cross" fill="var(--ember)" size={18} className="shrink-0" />
        {message}
        {onRetry ? (
          <button type="button" onClick={onRetry} className="font-bold underline decoration-1 underline-offset-4">
            {retryLabel}
          </button>
        ) : null}
      </p>
    );
  }

  if (level === "page") {
    return (
      <section role="alert" className={cx("grid justify-items-center gap-5 px-6 py-16 text-center", className)}>
        <div className="w-56 sm:w-72">
          <ObjectArt name="bubble-popped" sizes="288px" />
        </div>
        <h1 className="type-display text-balance">{title ?? "This one popped"}</h1>
        <p className="max-w-[44ch] type-body-lg text-ink-2">{message}</p>
        {onRetry ? (
          <Button size="lg" iconStart="refresh" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </section>
    );
  }

  return (
    <section role="alert" className={cx("grid justify-items-start gap-3 rounded-card border border-line bg-surface p-6", className)}>
      <div className="flex items-center gap-3">
        <Sticker name="cross" fill="var(--ember)" size={32} className="shrink-0" />
        <h2 className="type-heading-sm">{title ?? "That didn’t stick"}</h2>
      </div>
      <p className="max-w-[60ch] type-body text-ink-2">{message}</p>
      {onRetry ? (
        <Button variant="secondary" iconStart="refresh" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit
git commit -m "Add breathing skeletons, empty states and error states"
```

---

### Task 1.9: Counter and social action buttons

**Files:**
- Create: `src/shared/kit/format.ts`, `src/shared/kit/Counter.tsx`, `src/shared/kit/ActionButtons.tsx`

**Interfaces:**
- Consumes: `STICKER_PATHS` (Phase 0), `Glyph`, `useMotionPrefs`, `spring`.
- Produces:
  - `formatCount(value) → string`
  - `<Counter value className? />`
  - `<LikeButton liked count onToggle disabled? size? label? />`
  - `<SaveButton saved onToggle disabled? size? label? />`
  - `<CommentButton count onClick size? label? />`
  - `<ShareButton count onClick size? label? />`
  - `<FollowButton following onToggle pending? size? name? />`

- [ ] **Step 1: Count formatting and the rolling counter**

**File:** `src/shared/kit/format.ts`

```ts
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const standard = new Intl.NumberFormat("en");

/** Counts under 10,000 print in full ("1,204"); larger ones compact ("12.4K"). */
export function formatCount(value: number): string {
  return value >= 10_000 ? compact.format(value) : standard.format(value);
}
```

**File:** `src/shared/kit/Counter.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";
import { formatCount } from "./format";

const ROLL = {
  enter: (direction: number) => ({ y: `${direction * 100}%`, opacity: 0 }),
  center: { y: "0%", opacity: 1 },
  exit: (direction: number) => ({ y: `${direction * -100}%`, opacity: 0 }),
};

/** A count whose digits roll up when it rises and down when it falls. Tabular, so nothing jitters. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const { reduced } = useMotionPrefs();
  const [previous, setPrevious] = useState(value);
  const [direction, setDirection] = useState<1 | -1>(1);

  if (value !== previous) {
    setDirection(value > previous ? 1 : -1);
    setPrevious(value);
  }

  const text = formatCount(value);
  if (reduced) return <span className={cx("tnum", className)}>{text}</span>;

  return (
    <span className={cx("relative inline-grid overflow-hidden tnum", className)}>
      {/* While they roll, the old digits and the new are both in the page; assistive tech reads one value. */}
      <span className="sr-only">{text}</span>
      <AnimatePresence initial={false} custom={direction}>
        <motion.span
          aria-hidden
          key={value}
          custom={direction}
          variants={ROLL}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
```

- [ ] **Step 2: Action buttons**

**File:** `src/shared/kit/ActionButtons.tsx`

```tsx
import { motion, useAnimate } from "framer-motion";
import { useState } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { STICKER_PATHS, type StickerName } from "@/shared/brand/stickerPaths";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { Counter } from "./Counter";
import { cx } from "./cx";

type ActionSize = "sm" | "md";

const PILL = "relative inline-flex items-center gap-2 rounded-pill px-2.5 font-bold text-ink transition-colors duration-200 hover:bg-surface-2 disabled:opacity-45";
/** Drawn at 36 / 40px; the invisible `::after` makes every action a 44px touch target. */
const PILL_SIZE: Record<ActionSize, string> = {
  sm: "h-9 text-[13px] after:absolute after:-inset-1 after:content-['']",
  md: "h-10 text-[14px] after:absolute after:-inset-0.5 after:content-['']",
};
const ICON: Record<ActionSize, number> = { sm: 18, md: 22 };
const BURST = ["var(--ember)", "var(--sun)", "var(--blue)", "var(--mint)", "var(--violet)", "var(--lavender)", "var(--ember)", "var(--sun)"];

/** The object's sticker silhouette: outlined at rest, filled once active. */
function ActionIcon({ name, active, fill, size }: { name: StickerName; active: boolean; fill: string; size: number }) {
  return (
    <svg viewBox="-6 -6 112 112" width={size} height={size} aria-hidden overflow="visible">
      <path
        d={STICKER_PATHS[name].body[0]}
        style={{ fill: active ? fill : "transparent", stroke: active ? "var(--carbon)" : "currentColor", transition: "fill 150ms ease" }}
        strokeWidth={1.75}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Eight palette dots flung outward — plays once per like. */
function Burst() {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {BURST.map((color, index) => {
        const angle = (index / BURST.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 20 + (index % 2) * 6;
        return (
          <motion.i
            key={index}
            className="absolute top-1/2 left-1/2 -mt-1 -ml-1 h-2 w-2 rounded-full border border-carbon"
            style={{ background: color }}
            initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
            animate={{ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, scale: [0.4, 1, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
          />
        );
      })}
    </span>
  );
}

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
  size?: ActionSize;
  label?: string;
}

/** Like: the heart inflates and overshoots, confetti bursts, the count rolls. Unlike deflates it. */
export function LikeButton({ liked, count, onToggle, disabled, size = "md", label = "Like" }: LikeButtonProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const [burst, setBurst] = useState(0);

  const toggle = () => {
    const next = !liked;
    onToggle();
    if (reduced || !scope.current) return;
    if (next) {
      animate(scope.current, { scale: [1, 1.38, 0.9, 1] }, { duration: 0.52, times: [0, 0.35, 0.68, 1], ease: [0.2, 0.8, 0.2, 1] });
      setBurst((value) => value + 1);
    } else {
      animate(scope.current, { scaleX: [1, 1.08, 1], scaleY: [1, 0.8, 1] }, { duration: 0.36 });
    }
  };

  return (
    <motion.button
      type="button"
      aria-pressed={liked}
      aria-label={`${label}, ${count} ${count === 1 ? "like" : "likes"}`}
      disabled={disabled}
      onClick={toggle}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.press}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <span className="relative grid place-items-center">
        <span ref={scope} className="grid place-items-center">
          <ActionIcon name="heart" active={liked} fill="var(--ember)" size={ICON[size]} />
        </span>
        {burst > 0 && !reduced ? <Burst key={burst} /> : null}
      </span>
      <Counter value={count} />
    </motion.button>
  );
}

interface SaveButtonProps {
  saved: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: ActionSize;
  label?: string;
}

/** Save: the bookmark drops, squashes and sticks. */
export function SaveButton({ saved, onToggle, disabled, size = "md", label = "Save" }: SaveButtonProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLSpanElement>();

  const toggle = () => {
    const next = !saved;
    onToggle();
    if (reduced || !next || !scope.current) return;
    animate(
      scope.current,
      { y: [-14, 0, 0, 0], rotate: [-10, 0, 0, 0], scaleX: [1.15, 1.14, 0.96, 1], scaleY: [1.15, 0.82, 1.05, 1] },
      { duration: 0.56, times: [0, 0.55, 0.78, 1], ease: [0.2, 0.8, 0.2, 1] },
    );
  };

  return (
    <motion.button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      disabled={disabled}
      onClick={toggle}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.press}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <span ref={scope} className="grid place-items-center">
        <ActionIcon name="bookmark" active={saved} fill="var(--sun)" size={ICON[size]} />
      </span>
    </motion.button>
  );
}

interface CountActionProps {
  count: number;
  onClick: () => void;
  size?: ActionSize;
  label?: string;
}

/** Comment: opens the conversation. The bubble tilts on hover. */
export function CommentButton({ count, onClick, size = "md", label = "Comments" }: CountActionProps) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.button
      type="button"
      aria-label={`${label}, ${count}`}
      onClick={onClick}
      whileHover={reduced ? undefined : { rotate: -4 }}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.release}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <ActionIcon name="bubble" active={false} fill="var(--blue)" size={ICON[size]} />
      <Counter value={count} />
    </motion.button>
  );
}

/** Share: the loop spins once, then the share sheet opens. */
export function ShareButton({ count, onClick, size = "md", label = "Share" }: CountActionProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLSpanElement>();

  return (
    <motion.button
      type="button"
      aria-label={`${label}, ${count}`}
      onClick={() => {
        if (!reduced && scope.current) animate(scope.current, { rotate: [0, 360] }, { duration: 0.6, ease: [0.16, 1, 0.3, 1] });
        onClick();
      }}
      whileTap={reduced ? undefined : { scale: 0.93 }}
      transition={spring.press}
      className={cx(PILL, PILL_SIZE[size])}
    >
      <span ref={scope} className="grid place-items-center">
        <ActionIcon name="share" active={false} fill="var(--violet)" size={ICON[size]} />
      </span>
      <Counter value={count} />
    </motion.button>
  );
}

interface FollowButtonProps {
  following: boolean;
  onToggle: () => void;
  pending?: boolean;
  size?: ActionSize;
  /** Whose follow this is, for the accessible name. */
  name?: string;
}

/** Follow: the ink layer peels away diagonally to reveal a mint "Following". */
export function FollowButton({ following, onToggle, pending = false, size = "md", name }: FollowButtonProps) {
  const { reduced } = useMotionPrefs();
  const [scope, animate] = useAnimate<HTMLButtonElement>();

  return (
    <button
      ref={scope}
      type="button"
      aria-pressed={following}
      aria-label={name ? `Follow ${name}` : "Follow"}
      disabled={pending}
      onClick={() => {
        const next = !following;
        onToggle();
        if (next && !reduced && scope.current) animate(scope.current, { rotate: [0, -4, 0] }, { duration: 0.52, ease: [0.34, 1.56, 0.64, 1] });
      }}
      className={cx(
        // No overflow clipping: the layers are rounded themselves, so the `sm` hit area (::after) can reach 44px.
        "kit-follow relative inline-grid shrink-0 rounded-pill border border-line font-bold uppercase tracking-[0.032em] transition-[scale,opacity] duration-200 active:scale-95 disabled:cursor-wait disabled:opacity-60",
        size === "sm" ? "h-9 min-w-28 text-[11px] after:absolute after:-inset-1 after:content-['']" : "h-11 min-w-36 text-[13px]",
      )}
    >
      <span aria-hidden className="col-start-1 row-start-1 flex items-center justify-center gap-1.5 rounded-pill bg-mint px-4 text-carbon">
        <Glyph name="check" size={16} strokeWidth={2.5} />
        Following
      </span>
      <span aria-hidden className="kit-follow-top col-start-1 row-start-1 flex items-center justify-center rounded-pill bg-action px-4 text-action-ink">
        Follow
      </span>
    </button>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit
git commit -m "Add rolling counter and the like, save, comment, share and follow buttons"
```

---

### Task 1.10: Marquee

**Files:**
- Create: `src/shared/kit/Marquee.tsx`

**Interfaces:**
- Produces: `<Marquee items={string[]} duration?={seconds} className? />`

- [ ] **Step 1: Marquee**

**File:** `src/shared/kit/Marquee.tsx`

```tsx
import type { CSSProperties } from "react";
import { cx } from "./cx";

interface MarqueeProps {
  items: string[];
  /** Seconds per loop. */
  duration?: number;
  className?: string;
}

/**
 * The ink ticker band. Screen readers get the sentences once; the moving
 * copy is hidden from them. Pauses on hover and stops under reduced motion.
 */
export function Marquee({ items, duration = 40, className }: MarqueeProps) {
  const track = (
    <span className="flex shrink-0 items-center">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-7 pr-7">
          {item}
          <span aria-hidden>✦</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={cx("kit-marquee overflow-hidden whitespace-nowrap bg-action py-3 type-label text-action-ink", className)}>
      <span className="sr-only">{items.join(". ")}</span>
      <div aria-hidden className="kit-marquee-track flex w-max" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
        {track}
        {track}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit/Marquee.tsx
git commit -m "Add marquee"
```

---

### Task 1.11: Kit page — every component, every state

**Files:**
- Create: `src/pages/kit/ControlsSection.tsx`, `src/pages/kit/SurfacesSection.tsx`, `src/pages/kit/FeedbackSection.tsx`
- Modify: `src/pages/kit/KitPage.tsx` (render the three sections after `BrandSection`)

**Interfaces:**
- Consumes: every kit component from 1.1–1.10, `KitBlock` (Phase 0).

- [ ] **Step 1: Controls**

**File:** `src/pages/kit/ControlsSection.tsx`

```tsx
import { useState } from "react";
import { identityFor } from "@/shared/brand/identity";
import { Button } from "@/shared/kit/Button";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { DateField } from "@/shared/kit/DateField";
import { Field } from "@/shared/kit/Field";
import { IconButton } from "@/shared/kit/IconButton";
import { PasswordField } from "@/shared/kit/PasswordField";
import { RadioPills } from "@/shared/kit/RadioPills";
import { RuleList } from "@/shared/kit/RuleList";
import { SearchField } from "@/shared/kit/SearchField";
import { Segmented, Tabs } from "@/shared/kit/Segmented";
import { Select } from "@/shared/kit/Select";
import { tabId, tabPanelId } from "@/shared/kit/tabIds";
import { TextArea } from "@/shared/kit/TextArea";
import { Toggle } from "@/shared/kit/Toggle";
import { KitBlock } from "./KitBlock";

type Room = "everyone" | "following" | "yours" | "saved";
type ProfileTab = "posts" | "saved";

export function ControlsSection() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [handle, setHandle] = useState("leila.harb");
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [bio, setBio] = useState("Painted the balcony door sunflower yellow.");
  const [gender, setGender] = useState<string>();
  const [city, setCity] = useState("");
  const [birthday, setBirthday] = useState("");
  const [notify, setNotify] = useState(true);
  const [room, setRoom] = useState<Room>("everyone");
  const [tab, setTab] = useState<ProfileTab>("posts");

  const handleValid = /^[a-z0-9._]{3,15}$/i.test(handle);
  const rules = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "A capital", met: /[A-Z]/.test(password) },
    { label: "A lowercase", met: /[a-z]/.test(password) },
    { label: "A number", met: /\d/.test(password) },
    { label: "A symbol", met: /[#?!@$ %^&*-]/.test(password) },
  ];

  const runLoading = () => {
    setLoading(true);
    setDone(false);
    window.setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 1400);
  };

  return (
    <div className="grid gap-16" id="controls">
      <h2 className="type-display">Controls</h2>

      <KitBlock title="Buttons" note="Hover lifts and tilts, press squishes, release springs. Loading keeps the width.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Post</Button>
          <Button variant="secondary">Cancel</Button>
          <Button variant="ghost">Skip</Button>
          <Button variant="sticker" fill="sun">
            Join Aura
          </Button>
          <Button variant="sticker" fill="violet">
            Claim it
          </Button>
          <Button variant="destructive" iconStart="trash">
            Delete
          </Button>
          <Button variant="link">Forgot password?</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg" iconEnd="arrow-right">
            Large
          </Button>
          <Button loading={loading} success={done} onClick={runLoading}>
            {done ? "Saved" : "Save changes"}
          </Button>
          <Button disabled>Disabled</Button>
          <ButtonLink to="/__kit#controls" variant="secondary" iconEnd="arrow-up-right">
            Link button
          </ButtonLink>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <IconButton glyph="plus" label="New post" variant="primary" />
          <IconButton glyph="search" label="Search" />
          <IconButton glyph="bell" label="Alerts" badge={3} />
          <IconButton glyph="more" label="More" variant="ghost" size="sm" />
          <IconButton glyph="camera" label="Change photo" size="lg" />
        </div>
      </KitBlock>

      <KitBlock title="Input system" note="Hover, focus ring in the person's identity colour, error shake + message, success tick, loading, disabled.">
        <div className="grid gap-6 md:grid-cols-2">
          <Field
            label="Username"
            value={handle}
            onChange={(event) => setHandle(event.target.value)}
            iconStart="at"
            counter={{ value: handle.length, max: 15 }}
            ringColor={identityFor(handle).color.hex}
            success={handleValid}
            error={handle && !handleValid ? "3–15 letters, numbers, dots or underscores." : undefined}
            hint="Your ring is your identity colour."
          />
          <div className="grid gap-3">
            <Field
              label="Email"
              type="email"
              iconStart="mail"
              placeholder="name@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(undefined);
              }}
              error={emailError}
            />
            <Button
              variant="secondary"
              size="sm"
              className="justify-self-start"
              onClick={() => setEmailError(/^\S+@\S+\.\S+$/.test(email) ? undefined : "Enter a valid email address.")}
            >
              Validate
            </Button>
          </div>
          <div className="grid gap-3">
            <PasswordField
              label="Password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              success={rules.every((rule) => rule.met)}
            />
            <RuleList rules={rules} />
          </div>
          <SearchField value={query} onValueChange={setQuery} placeholder="Search people" loading={query.length > 2} />
          <TextArea label="Bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={60} hint="Keep it short." />
          <div className="grid gap-6">
            <Select
              label="City"
              placeholder="Choose a city"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              options={[
                { value: "cairo", label: "Cairo" },
                { value: "lisbon", label: "Lisbon" },
                { value: "accra", label: "Accra" },
              ]}
            />
            <DateField label="Date of birth" value={birthday} onChange={(event) => setBirthday(event.target.value)} />
          </div>
          <RadioPills
            label="Gender"
            name="kit-gender"
            value={gender}
            onChange={setGender}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
            ]}
          />
          <Field label="Disabled" value="Can’t touch this" disabled readOnly />
        </div>
      </KitBlock>

      <KitBlock title="Selection" note="Arrow keys move through the segmented control; the ink sticker slides.">
        <div className="grid max-w-md gap-6">
          <Toggle checked={notify} onChange={setNotify} label="Night paper follows the system" description="Switch off to choose it yourself." />
          <Toggle checked={false} onChange={() => undefined} label="Disabled toggle" disabled />
        </div>
        <Segmented<Room>
          label="Rooms"
          value={room}
          onChange={setRoom}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "following", label: "Following" },
            { value: "yours", label: "Yours" },
            { value: "saved", label: "Saved" },
          ]}
        />
        <div className="grid gap-4">
          <Tabs<ProfileTab>
            idBase="kit-tabs"
            label="Profile sections"
            size="sm"
            value={tab}
            onChange={setTab}
            options={[
              { value: "posts", label: "Posts", count: 12 },
              { value: "saved", label: "Saved", count: 4 },
            ]}
          />
          <div role="tabpanel" id={tabPanelId("kit-tabs", tab)} aria-labelledby={tabId("kit-tabs", tab)} className="type-body text-ink-2">
            {tab === "posts" ? "Twelve posts would hang here." : "Four saved posts would hang here."}
          </div>
        </div>
      </KitBlock>
    </div>
  );
}
```

- [ ] **Step 2: Surfaces**

**File:** `src/pages/kit/SurfacesSection.tsx`

```tsx
import { useState } from "react";
import { Avatar } from "@/shared/kit/Avatar";
import { Button } from "@/shared/kit/Button";
import { Card } from "@/shared/kit/Card";
import { ConfirmDialog } from "@/shared/kit/ConfirmDialog";
import { Field } from "@/shared/kit/Field";
import { IconButton } from "@/shared/kit/IconButton";
import { Menu } from "@/shared/kit/Menu";
import { Modal } from "@/shared/kit/Modal";
import { Tooltip } from "@/shared/kit/Tooltip";
import { useToast } from "@/shared/kit/toast/useToast";
import { KitBlock } from "./KitBlock";

export function SurfacesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [lastChoice, setLastChoice] = useState("Nothing chosen yet.");
  const toast = useToast();

  return (
    <div className="grid gap-16" id="surfaces">
      <h2 className="type-display">Surfaces</h2>

      <KitBlock title="Cards" note="Interactive cards lift and tilt; the rest stay put.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <p className="font-bold">Default</p>
            <p className="type-body text-ink-2">Posts, panels, comments.</p>
          </Card>
          <Card variant="interactive" tabIndex={0}>
            <p className="font-bold">Interactive</p>
            <p className="type-body text-ink-2">Hover me, press me.</p>
          </Card>
          <Card variant="featured">
            <p className="font-bold">Featured</p>
            <p className="type-body text-ink-2">A band-coloured highlight.</p>
          </Card>
          <Card variant="compact" band="sun">
            <p className="font-bold">Compact · Sunburst band</p>
          </Card>
          <Card variant="profile" band="lav">
            <Avatar identityKey="maya.s" name="Maya S" size="lg" />
            <p className="font-bold">Profile</p>
          </Card>
          <Card variant="content">A content card sets its text at body-large for reading.</Card>
        </div>
      </KitBlock>

      <KitBlock title="Avatars" note="The photo sits inside the person's identity sticker; initials until it decodes.">
        <div className="flex flex-wrap items-end gap-5">
          <Avatar identityKey="leila.harb" name="Leila Harb" size="sm" />
          <Avatar identityKey="idris.okafor" name="Idris Okafor" size="md" />
          <Avatar identityKey="noor_ali" name="Noor Ali" size="lg" />
          <Avatar identityKey="kofi.m" name="Kofi M" size="xl" />
          <Avatar identityKey="sam.k" name="Sam K" size="lg" frame={false} />
        </div>
      </KitBlock>

      <KitBlock title="Modal, sheet, confirm" note="Dialog from 640px up; a draggable bottom sheet on phones. Escape, backdrop and focus trap everywhere.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Delete post…
          </Button>
        </div>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Share to your wall"
          description="Add a caption, or share it as it is."
          footer={
            <>
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  toast.show({ title: "Shared. It’s on your wall." });
                }}
              >
                Share
              </Button>
            </>
          }
        >
          <Field label="Caption" placeholder="Say something about it" />
        </Modal>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            toast.show({ tone: "info", title: "Deleted", action: { label: "Undo", onClick: () => undefined } });
          }}
          title="Delete this post?"
          description="This can’t be undone."
          confirmLabel="Delete"
          destructive
        />
      </KitBlock>

      <KitBlock title="Menu and tooltip" note="Menu: arrows, Home/End, type a letter, Escape. Tooltip: hover waits 400ms, focus is instant.">
        <div className="flex flex-wrap items-center gap-4">
          <Menu
            label="Post options"
            items={[
              { label: "Edit post", glyph: "edit", onSelect: () => setLastChoice("Edit post") },
              { label: "Copy link", glyph: "link", onSelect: () => setLastChoice("Copy link") },
              { label: "Report", glyph: "alert", onSelect: () => setLastChoice("Report"), disabled: true },
              { label: "Delete post", glyph: "trash", tone: "danger", onSelect: () => setConfirmOpen(true) },
            ]}
          />
          <Tooltip label="New post">
            <IconButton glyph="plus" label="New post" variant="primary" />
          </Tooltip>
          <Tooltip label="Alerts" side="bottom">
            <IconButton glyph="bell" label="Alerts" />
          </Tooltip>
          <p className="type-caption text-ink-2">{lastChoice}</p>
        </div>
      </KitBlock>

      <KitBlock title="Toasts" note="Slap on as stickers, pause on hover, lift away. Errors stay 5s.">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast.show({ title: "Posted. It’s on the wall." })}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => toast.show({ tone: "info", title: "New posts above", description: "Tap to load them." })}>
            Info
          </Button>
          <Button variant="secondary" onClick={() => toast.show({ tone: "warning", title: "480 / 500 — almost at the limit." })}>
            Warning
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast.show({
                tone: "error",
                title: "That didn’t stick.",
                description: "Check your connection and try again.",
                action: { label: "Retry", onClick: () => undefined },
              })
            }
          >
            Error
          </Button>
        </div>
      </KitBlock>
    </div>
  );
}
```

- [ ] **Step 3: Feedback**

**File:** `src/pages/kit/FeedbackSection.tsx`

```tsx
import { useState } from "react";
import { CommentButton, FollowButton, LikeButton, SaveButton, ShareButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { Counter } from "@/shared/kit/Counter";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { Marquee } from "@/shared/kit/Marquee";
import { ListSkeleton, PostSkeleton } from "@/shared/kit/Skeleton";
import { KitBlock } from "./KitBlock";

export function FeedbackSection() {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(41);
  const [saved, setSaved] = useState(false);
  const [shares, setShares] = useState(3);
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(1204);

  return (
    <div className="grid gap-16" id="feedback">
      <h2 className="type-display">Feedback</h2>

      <KitBlock title="Social actions" note="Like inflates with a confetti burst, save drops and sticks, share spins, follow peels.">
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface p-3">
          <LikeButton
            liked={liked}
            count={likes}
            onToggle={() => {
              setLiked((value) => !value);
              setLikes((value) => value + (liked ? -1 : 1));
            }}
          />
          <CommentButton count={7} onClick={() => undefined} />
          <ShareButton count={shares} onClick={() => setShares((value) => value + 1)} />
          <SaveButton saved={saved} onToggle={() => setSaved((value) => !value)} />
          <span className="ml-auto" />
          <FollowButton following={following} onToggle={() => setFollowing((value) => !value)} name="Leila Harb" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LikeButton liked count={2} onToggle={() => undefined} size="sm" />
          <FollowButton following onToggle={() => undefined} size="sm" />
          <FollowButton following={false} pending onToggle={() => undefined} size="sm" />
        </div>
      </KitBlock>

      <KitBlock title="Counter">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => setCount((value) => value - 1)}>
            −1
          </Button>
          <Counter value={count} className="type-heading" />
          <Button variant="secondary" size="sm" onClick={() => setCount((value) => value + 1)}>
            +1
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCount((value) => value + 12000)}>
            +12K
          </Button>
        </div>
      </KitBlock>

      <KitBlock title="Loading" note="Skeletons breathe. No shimmer, no gradients.">
        <div className="grid gap-6 md:grid-cols-2">
          <PostSkeleton />
          <ListSkeleton rows={3} label="Loading people" />
        </div>
      </KitBlock>

      <KitBlock title="Empty states" note="Deflated objects: waiting for breath, not broken.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-line bg-surface">
            <EmptyState compact titleAs="h3" object="bubble-deflated" title="Nothing here yet" body="Follow a few people and the wall fills up." action={{ label: "Find people", to: "/__kit" }} />
          </div>
          <div className="rounded-card border border-line bg-surface">
            <EmptyState compact titleAs="h3" object="bell-deflated" title="All quiet" body="Likes, comments and follows land here." />
          </div>
          <div className="rounded-card border border-line bg-surface">
            <EmptyState compact titleAs="h3" object="bookmark-deflated" title="No saved posts" body="Save a post and it sticks here." />
          </div>
        </div>
      </KitBlock>

      <KitBlock title="Error states">
        <ErrorState level="inline" message="Couldn’t load replies." onRetry={() => undefined} />
        <ErrorState message="The wall didn’t load. Check your connection and try again." onRetry={() => undefined} />
        <div className="rounded-card border border-line">
          <ErrorState level="page" message="The page you’re looking for isn’t here any more." onRetry={() => undefined} retryLabel="Back to the wall" />
        </div>
      </KitBlock>

      <KitBlock title="Marquee">
        <Marquee items={["Aura — from the Greek αὔρα, breath", "Everything here breathes", "Paper. Outline. Inflate."]} />
      </KitBlock>
    </div>
  );
}
```

- [ ] **Step 4: Render the sections**

In `src/pages/kit/KitPage.tsx`:
1. Add the imports under `import { BrandSection } from "./BrandSection";`:
```tsx
import { ControlsSection } from "./ControlsSection";
import { FeedbackSection } from "./FeedbackSection";
import { SurfacesSection } from "./SurfacesSection";
```
2. Replace `<BrandSection />` inside `<main>` with:
```tsx
        <BrandSection />
        <ControlsSection />
        <SurfacesSection />
        <FeedbackSection />
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit src/pages/kit src/app` → no errors.

Browser `/__kit`:
- **All four widths × two themes:** no horizontal scroll at 375 (`scrollWidth === clientWidth`), and no console errors.
- **Keyboard only:** Tab through the buttons; the Segmented arrow keys move the selection; the Menu arrows, type-ahead and Escape work; the Modal traps focus and Escape closes it; Tab lands on the RadioPills and arrows switch them.
- **Field states:** the username ring colour changes with the handle; Validate with a bad email shakes it and shows the message; the password rules turn mint one by one; the bio counter turns into a Sunburst sticker at 54/60.
- **Modal at 375:** it opens as a bottom sheet and drags down to close.
- **With the pane visible:** like bursts and rolls the count; save drops; share spins; follow peels; toasts slap on and lift.
- **Reduced motion:** no bursts, no rolling, no shake; the state still changes.

- [ ] **Step 6: Commit**

```bash
git add src/pages/kit
git commit -m "Show every kit component and state on the kit page"
```
