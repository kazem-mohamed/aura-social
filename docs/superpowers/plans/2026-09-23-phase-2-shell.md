# Aura Rebrand — Phase 2: App Shell · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Accession Card shell with Aura's (spec §8, §10):
- the floating dock on every breakpoint, with a central Post button that opens the composer sheet;
- the logo sticker top-left;
- the poster page header;
- the peel route transition and the peel theme switch;
- a root gate for `/` (members get the wall; guests are redirected to sign-in until Phase 4 adds the landing page);
- new route fallback, error boundary and document titles.

**Architecture:**
- `RootLayout` picks the member shell (`MainLayout`: header + main + `Dock` inside `ComposerProvider`) or the guest shell (`GuestLayout`).
- View Transitions are styled in `src/styles/transitions.css`. The dock gets its own `view-transition-name`, so pages peel under it while it stays put.
- The composer is a new `PostComposer` in `features/posts`, opened app-wide through a small composer context. Phase 3 reuses it inline on the wall.

**Tech Stack:** React 19, React Router 7 (`NavLink viewTransition`, `ScrollRestoration`, `matchPath`), framer-motion 12 (`layoutId`), View Transitions API, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-09-23-aura-sticker-rebrand-design.md` (§6 route/dock motion, §8 shell, §10 routing). **Depends on:** Phases 0–1.

## Global Constraints

- Everything from Phase 1's Global Constraints applies: no shadows or gradients, ink text, never put Tailwind translate utilities on a Motion-animated element, reduced motion everywhere, `.tsx` exports components only.
- Route paths and legacy redirects do not change. Auth guards keep their behaviour.
- The dock is `nav[aria-label="Primary"]`. Items are ≥48px on phones. Labels show at ≥1024px; tablets (640–1023) get tooltips.
- The composer uses the existing `useCreatePost` + `postDraftSchema`. No logic changes.
- Verification:
  - `npm run typecheck`, and `npx eslint` on the changed paths.
  - Browser: `/auth/login` as a guest; `/` redirects a guest to sign-in; `/nope` shows the 404 inside the guest shell; `/__kit` still works.
  - With a signed-in session (the user signs in themselves): the dock at 375 / 768 / 1280 / 1440, active states, the composer sheet, the peel between routes, and the theme peel.

---

### Task 2.1: Transitions, theme hook, identity key, text-area counter

**Files:**
- Create: `src/styles/transitions.css`, `src/shared/lib/useTheme.ts`
- Modify (replace): `src/styles/base.css` (theme/route transition rules move out), `src/index.css`
- Modify: `src/shared/brand/identity.ts` (strip a leading `@` from the key), `src/shared/kit/TextArea.tsx` (`counter` prop)

**Interfaces:**
- Produces:
  - `useTheme() → { theme: Theme; toggle(origin?): void; set(theme, origin?): void }`
  - `identityFor("@leila")` ≡ `identityFor("leila")`
  - `<TextArea counter?: "always" | "near" …>`, where "near" shows the count only from 80% of `maxLength`
  - CSS: route peel on `::view-transition-*(root)`, theme peel under `:root.theme-switching`, and a static dock layer

- [ ] **Step 1: Transition styles**

**File:** `src/styles/transitions.css`

```css
/* View Transitions — spec §6.
   Routes: the old page peels away from its top-right corner while the new
   one waits underneath. Theme: the new theme peels on from the same corner.
   The dock is its own layer and never moves. */

::view-transition-old(root) {
  z-index: 2;
  animation: vt-peel-away var(--dur-route) var(--ease-out-css) both;
}
::view-transition-new(root) {
  z-index: 1;
  animation: vt-settle var(--dur-route) var(--ease-out-css) both;
}

@keyframes vt-peel-away {
  0% {
    clip-path: polygon(0 0, 100% 0, 100% 0, 100% 100%, 0 100%);
  }
  50% {
    clip-path: polygon(0 0, 0 0, 100% 100%, 100% 100%, 0 100%);
  }
  100% {
    clip-path: polygon(0 100%, 0 100%, 0 100%, 0 100%, 0 100%);
  }
}
@keyframes vt-settle {
  from {
    transform: scale(0.985);
  }
}

:root.theme-switching::view-transition-old(root) {
  z-index: 1;
  animation: none;
}
:root.theme-switching::view-transition-new(root) {
  z-index: 2;
  animation: vt-peel-on 620ms var(--ease-out-css) both;
}
@keyframes vt-peel-on {
  0% {
    clip-path: polygon(100% 0, 100% 0, 100% 0, 100% 0, 100% 0);
  }
  50% {
    clip-path: polygon(0 0, 0 0, 100% 0, 100% 100%, 100% 100%);
  }
  100% {
    clip-path: polygon(0 100%, 0 0, 100% 0, 100% 100%, 0 100%);
  }
}

::view-transition-group(dock) {
  animation: none;
}
::view-transition-old(dock) {
  display: none;
}
::view-transition-new(dock) {
  animation: none;
}

/* The dock slides up once, on first mount. */
@keyframes dock-in {
  from {
    transform: translateY(140%);
  }
}
.dock-enter {
  animation: dock-in 620ms var(--ease-spring-css) both;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root),
  :root.theme-switching::view-transition-new(root) {
    animation: none !important;
  }
  .dock-enter {
    animation: none;
  }
}
```

**File:** `src/styles/base.css`

```css
/* Base element styles for the Aura system. */

@layer base {
  html {
    -webkit-text-size-adjust: 100%;
    color-scheme: light;
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
  }

  body {
    margin: 0;
    min-height: 100dvh;
    background: var(--ground);
    color: var(--ink);
    font-family: var(--font-sans);
    font-size: 15px;
    font-weight: 500;
    line-height: 1.45;
    letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  :focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 3px;
  }

  ::selection {
    background: var(--sun);
    color: var(--carbon);
  }

  input,
  textarea,
  select,
  button {
    font: inherit;
    color: inherit;
    letter-spacing: inherit;
  }

  input,
  textarea {
    caret-color: var(--ink);
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  textarea:-webkit-autofill {
    -webkit-text-fill-color: var(--ink);
    -webkit-box-shadow: 0 0 0 1000px var(--surface) inset;
    transition: background-color 100000s ease-in-out 0s;
  }

  input[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0.7;
    cursor: pointer;
  }
  :root[data-theme="dark"] input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }

  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }

  option,
  optgroup {
    background: var(--surface);
    color: var(--ink);
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.001s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001s !important;
    scroll-behavior: auto !important;
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
@import "./styles/transitions.css";
@import "./styles/legacy.css";
```

- [ ] **Step 2: Theme hook**

**File:** `src/shared/lib/useTheme.ts`

```ts
import { useSyncExternalStore } from "react";
import { readTheme, setTheme, watchSystemTheme, type Theme } from "./theme";

function subscribe(notify: () => void): () => void {
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const stopWatching = watchSystemTheme(() => notify());
  return () => {
    observer.disconnect();
    stopWatching();
  };
}

/**
 * The live theme, shared by every caller (it reads the `data-theme`
 * attribute), plus setters that run the peel transition from `origin`.
 */
export function useTheme() {
  const theme = useSyncExternalStore<Theme>(subscribe, readTheme, () => "light");

  return {
    theme,
    set: (next: Theme, origin?: { x: number; y: number }) => setTheme(next, origin),
    toggle: (origin?: { x: number; y: number }) => setTheme(theme === "dark" ? "light" : "dark", origin),
  };
}
```

- [ ] **Step 3: Identity key ignores the `@`**

In `src/shared/brand/identity.ts`, inside `identityFor`, replace
`const normalised = key.toLowerCase().trim() || "anon";`
with
`const normalised = key.toLowerCase().trim().replace(/^@/, "") || "anon";`
so `@leila` and `leila` (handles vs usernames) resolve to the same sticker.

- [ ] **Step 4: Text-area counter visibility**

In `src/shared/kit/TextArea.tsx`:
1. Add to `TextAreaProps`:
```tsx
  /** `always` shows the count; `near` only from 80% of `maxLength` (long-form composers). */
  counter?: "always" | "near";
```
2. Destructure `counter = "always"` in the component signature, after `hideLabel = false,`.
3. Replace `{maxLength !== undefined ? (` with
```tsx
        {maxLength !== undefined && (counter === "always" || length >= maxLength * 0.8) ? (
```

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared src/styles` → no new errors.

```bash
git add src/styles src/index.css src/shared/lib/useTheme.ts src/shared/brand/identity.ts src/shared/kit/TextArea.tsx
git commit -m "Add peel route and theme transitions, shared theme hook"
```

---

### Task 2.2: Poster header

**Files:**
- Create: `src/shared/kit/useFitText.ts`, `src/shared/kit/PosterHeader.tsx`

**Interfaces:**
- Produces:
  - `useFitText<T extends HTMLElement>(text: string) → RefObject<T | null>` (shrinks a `nowrap` element's font size until it fits its own width)
  - `<PosterHeader title eyebrow? lede? actions? size?("poster"|"xl") children? className? />` (the page's `<h1>`)

- [ ] **Step 1: Fit-to-width hook**

**File:** `src/shared/kit/useFitText.ts`

```ts
import { useLayoutEffect, useRef } from "react";

/**
 * Crushed display type is set huge on purpose. This keeps a single line of
 * it inside its box: the font size steps down until the text stops
 * overflowing, and re-fits on resize and once web fonts arrive.
 * The element needs `white-space: nowrap`.
 */
export function useFitText<T extends HTMLElement>(text: string) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fit = () => {
      el.style.fontSize = "";
      const available = el.clientWidth;
      const needed = el.scrollWidth;
      if (needed > available && available > 0) {
        const size = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = `${Math.floor((size * available) / needed)}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    void document.fonts?.ready.then(fit);
    return () => observer.disconnect();
  }, [text]);

  return ref;
}
```

- [ ] **Step 2: Poster header**

**File:** `src/shared/kit/PosterHeader.tsx`

```tsx
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { spring } from "@/shared/motion/tokens";
import { cx } from "./cx";
import { useFitText } from "./useFitText";

interface PosterHeaderProps {
  /** The page's name in crushed display type — it is the page's `<h1>`. */
  title: string;
  /** One line under the poster: context, or a person's handle. Never a label above it. */
  lede?: ReactNode;
  actions?: ReactNode;
  /** `xl` is for a person's name on their profile. */
  size?: "poster" | "xl";
  children?: ReactNode;
  className?: string;
}

/**
 * Every member page opens like a poster: its name, huge and crushed, pressed
 * onto the page with a small squash as it lands. One line, always — it
 * shrinks to fit rather than wrap.
 */
export function PosterHeader({ title, lede, actions, size = "poster", children, className }: PosterHeaderProps) {
  const titleRef = useFitText<HTMLHeadingElement>(title);

  return (
    <header className={cx("grid grid-cols-[minmax(0,1fr)] gap-5 pt-8 pb-8 sm:pt-12 sm:pb-10", className)}>
      <motion.h1
        ref={titleRef}
        className={cx(size === "xl" ? "type-display-xl" : "type-poster", "min-w-0 whitespace-nowrap")}
        style={{ transformOrigin: "0% 100%" }}
        initial={{ scaleY: 0.82, scaleX: 1.04 }}
        animate={{ scaleY: 1, scaleX: 1 }}
        transition={spring.release}
      >
        {title}
      </motion.h1>
      {lede || actions ? (
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          {lede ? <div className="max-w-[56ch] type-body-lg text-ink-2">{lede}</div> : <span />}
          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </header>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/kit` → no errors.

```bash
git add src/shared/kit/useFitText.ts src/shared/kit/PosterHeader.tsx
git commit -m "Add the poster page header"
```

---

### Task 2.3: Composer (context, sheet, component)

**Files:**
- Create: `src/features/posts/composer/composerContext.ts`, `src/features/posts/composer/useComposer.ts`, `src/features/posts/composer/ComposerProvider.tsx`, `src/features/posts/components/PostComposer.tsx`

**Interfaces:**
- Consumes: `useCreatePost` (`../hooks/usePostMutations`), `postDraftSchema` (`../model/post.schemas`), `useImagePreview`, `useCurrentUser`, kit `Avatar`, `Button`, `IconButton`, `TextArea`, `Modal`, `useToast`.
- Produces:
  - `<PostComposer onPosted? autoFocus? className? />`
  - `useComposer() → { open(): void; close(): void; isOpen: boolean }`
  - `<ComposerProvider>` (renders the sheet)

- [ ] **Step 1: The composer**

**File:** `src/features/posts/components/PostComposer.tsx`

```tsx
import { useRef, useState, type FormEvent } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { MAX_POST_BODY_LENGTH } from "@/shared/config/constants";
import { useImagePreview } from "@/shared/hooks/useImagePreview";
import { Avatar } from "@/shared/kit/Avatar";
import { Button } from "@/shared/kit/Button";
import { cx } from "@/shared/kit/cx";
import { IconButton } from "@/shared/kit/IconButton";
import { TextArea } from "@/shared/kit/TextArea";
import { useToast } from "@/shared/kit/toast/useToast";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { useCreatePost } from "../hooks/usePostMutations";
import { postDraftSchema } from "../model/post.schemas";

interface PostComposerProps {
  /** Called after a successful post — the sheet closes itself with it. */
  onPosted?: () => void;
  autoFocus?: boolean;
  className?: string;
}

/** Write a post: text, one image, or both. Your identity sticker signs it before you do. */
export function PostComposer({ onPosted, autoFocus = false, className }: PostComposerProps) {
  const { data: me } = useCurrentUser();
  const createPost = useCreatePost();
  const image = useImagePreview();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();

  const canPost = body.trim().length > 0 || image.file !== null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const draft = postDraftSchema.safeParse({ body, imageFile: image.file });
    if (!draft.success) {
      setError(draft.error.issues[0]?.message ?? "This post can’t be sent yet.");
      return;
    }
    setError(undefined);
    createPost.mutate(
      { body: draft.data.body ?? "", imageFile: draft.data.imageFile ?? null },
      {
        onSuccess: () => {
          setBody("");
          image.clear();
          toast.show({ title: "Posted. It’s on the wall." });
          onPosted?.();
        },
        onError: (failure) => setError(getErrorMessage(failure, "That didn’t stick. Try posting again.")),
      },
    );
  };

  return (
    <form onSubmit={submit} aria-label="New post" className={cx("grid gap-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar identityKey={me?.handle ?? "you"} name={me?.name ?? "You"} photo={me?.photo} size="md" className="mt-1" />
        <TextArea
          label="Write a post"
          hideLabel
          className="min-w-0 flex-1"
          placeholder="Say it out loud."
          value={body}
          maxLength={MAX_POST_BODY_LENGTH}
          counter="near"
          autoFocus={autoFocus}
          error={error}
          onChange={(event) => {
            setBody(event.target.value);
            if (error) setError(undefined);
          }}
        />
      </div>

      {image.previewUrl ? (
        <figure className="relative overflow-hidden rounded-card border border-line sm:ml-[52px]">
          <img src={image.previewUrl} alt="Image to post" className="block max-h-80 w-full object-cover" />
          <IconButton glyph="close" label="Remove image" size="sm" className="absolute top-2 right-2" onClick={image.clear} />
        </figure>
      ) : null}

      <div className="flex items-center gap-2 sm:pl-[52px]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            image.select(file);
            setError(undefined);
          }}
        />
        <Button variant="ghost" size="sm" iconStart="image" onClick={() => fileRef.current?.click()}>
          {image.file ? "Change image" : "Add image"}
        </Button>
        <Button type="submit" className="ml-auto" disabled={!canPost} loading={createPost.isPending}>
          Post
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Context, hook, provider**

**File:** `src/features/posts/composer/composerContext.ts`

```ts
import { createContext } from "react";

export interface ComposerApi {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

export const ComposerContext = createContext<ComposerApi | null>(null);
```

**File:** `src/features/posts/composer/useComposer.ts`

```ts
import { useContext } from "react";
import { ComposerContext, type ComposerApi } from "./composerContext";

/** Open the new-post sheet from anywhere in the member shell. */
export function useComposer(): ComposerApi {
  const api = useContext(ComposerContext);
  if (!api) throw new Error("useComposer must be used inside <ComposerProvider>.");
  return api;
}
```

**File:** `src/features/posts/composer/ComposerProvider.tsx`

```tsx
import { useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/shared/kit/Modal";
import { PostComposer } from "../components/PostComposer";
import { ComposerContext, type ComposerApi } from "./composerContext";

/** Holds the new-post sheet the dock's Post button opens. */
export function ComposerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const api = useMemo<ComposerApi>(
    () => ({ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }),
    [isOpen],
  );

  return (
    <ComposerContext.Provider value={api}>
      {children}
      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="New post" description="Text, one image, or both.">
        <PostComposer autoFocus onPosted={() => setIsOpen(false)} />
      </Modal>
    </ComposerContext.Provider>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/features/posts` → no new errors (old files may carry none).

```bash
git add src/features/posts/composer src/features/posts/components/PostComposer.tsx
git commit -m "Add the post composer and the app-wide composer sheet"
```

---

### Task 2.4: Shell pieces — dock, header, skip link, titles, fallback, error boundary

**Files:**
- Create in `src/layouts/components/`: `Dock.tsx`, `ShellHeader.tsx`, `SkipLink.tsx`, `DocumentTitle.tsx`, `RouteFallback.tsx`
- Create: `src/app/providers/AppErrorBoundary.tsx`

**Interfaces:**
- Consumes: `useComposer` (2.3), `useUnreadNotificationCount`, `Tooltip`, `Glyph`, `Logo`, `PeelLoader`, `ErrorState`, `useMediaQuery`, `spring`, `routes`.
- Produces: `<Dock />`, `<ShellHeader />`, `<SkipLink />`, `<DocumentTitle />`, `<RouteFallback />`, `<AppErrorBoundary>`.

- [ ] **Step 1: The dock**

**File:** `src/layouts/components/Dock.tsx`

```tsx
import { motion } from "framer-motion";
import { matchPath, NavLink, useLocation } from "react-router";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { cx } from "@/shared/kit/cx";
import { Tooltip } from "@/shared/kit/Tooltip";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { useUnreadNotificationCount } from "@/features/notifications/hooks/useNotifications";
import { useComposer } from "@/features/posts/composer/useComposer";

interface Destination {
  key: string;
  to: string;
  label: string;
  glyph: GlyphName;
  /** Paths (matched exactly) on which this item is the current page. */
  match: string[];
}

const LEFT: Destination[] = [
  { key: "wall", to: routes.home, label: "Wall", glyph: "wall", match: ["/"] },
  { key: "people", to: routes.people, label: "People", glyph: "people", match: ["/people"] },
];
const RIGHT: Destination[] = [
  { key: "alerts", to: routes.notifications, label: "Alerts", glyph: "bell", match: ["/notifications"] },
  { key: "you", to: routes.profile, label: "You", glyph: "user", match: ["/profile", "/settings"] },
];

function PostButton({ onClick }: { onClick: () => void }) {
  const { reduced } = useMotionPrefs();
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="New post"
      className="mx-1 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-carbon bg-sun text-carbon"
      whileHover={reduced ? undefined : { rotate: 90, scale: 1.06 }}
      whileTap={reduced ? undefined : { scale: 0.9 }}
      transition={spring.release}
    >
      <Glyph name="plus" size={24} strokeWidth={2.25} />
    </motion.button>
  );
}

/**
 * The one navigation, on every device: a floating ink pill at thumb height.
 * The current page wears a sticker that slides between items; the Post
 * button in the middle opens the composer from anywhere.
 */
export function Dock() {
  const { pathname } = useLocation();
  const composer = useComposer();
  const { data: unread } = useUnreadNotificationCount();
  const isTablet = useMediaQuery("(min-width: 640px) and (max-width: 1023px)");

  const unreadCount = typeof unread === "number" ? unread : 0;
  const activeKey = [...LEFT, ...RIGHT].find((d) => d.match.some((path) => matchPath({ path, end: true }, pathname)))?.key;

  const renderItem = (destination: Destination) => {
    const isActive = activeKey === destination.key;
    const badge = destination.key === "alerts" ? unreadCount : 0;

    const link = (
      <NavLink
        key={destination.key}
        to={destination.to}
        viewTransition
        aria-label={badge ? `${destination.label}, ${badge} unread` : destination.label}
        aria-current={isActive ? "page" : undefined}
        className={cx(
          "relative isolate flex h-14 min-w-14 flex-col items-center justify-center gap-0.5 rounded-pill px-2 transition-colors duration-200",
          "sm:h-12 sm:min-w-12 sm:flex-row sm:px-3 lg:gap-2 lg:px-4",
          isActive ? "text-ink" : "text-action-ink hover:bg-action-ink/10",
        )}
      >
        {isActive ? (
          <motion.span layoutId="dock-active" aria-hidden className="absolute inset-0 -z-10 rounded-pill bg-ground" transition={spring.release} />
        ) : null}
        <span className="relative">
          <Glyph name={destination.glyph} size={22} />
          {badge ? (
            <span
              aria-hidden
              className="absolute -top-1.5 -right-2 grid h-[18px] min-w-[18px] place-items-center rounded-pill border border-carbon bg-ember px-1 text-[10px] leading-none font-bold text-carbon tnum"
            >
              {badge > 99 ? "99+" : badge}
            </span>
          ) : null}
        </span>
        <span className="text-[10px] font-bold tracking-[0.032em] uppercase sm:hidden lg:inline lg:text-[12px]">{destination.label}</span>
      </NavLink>
    );

    return isTablet ? (
      <Tooltip key={destination.key} label={destination.label}>
        {link}
      </Tooltip>
    ) : (
      link
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="dock-enter fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 z-(--z-dock) -translate-x-1/2 [view-transition-name:dock]"
    >
      <div className="flex items-center gap-0.5 rounded-pill border border-line bg-action p-1.5 text-action-ink sm:gap-1">
        {LEFT.map(renderItem)}
        <PostButton onClick={composer.open} />
        {RIGHT.map(renderItem)}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Header, skip link, titles, fallback**

**File:** `src/layouts/components/ShellHeader.tsx`

```tsx
import { Link } from "react-router";
import { Logo } from "@/shared/brand/Logo";
import { routes } from "@/app/router/routes";

/** The logo sticker, top-left. It scrolls away with the page; the dock owns persistence. */
export function ShellHeader() {
  return (
    <header className="mx-auto flex w-full max-w-(--page-max) items-center px-4 pt-4 sm:px-8 sm:pt-6">
      <Link to={routes.home} viewTransition aria-label="Aura — back to the wall" className="rounded-chip">
        <Logo interactive title={null} className="h-11 w-auto sm:h-12" />
      </Link>
    </header>
  );
}
```

**File:** `src/layouts/components/SkipLink.tsx`

```tsx
/** First stop for keyboard users: jump past the header straight to the page. */
export function SkipLink() {
  return (
    <a
      href="#content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-(--z-toast) focus:rounded-pill focus:border focus:border-carbon focus:bg-sun focus:px-4 focus:py-2.5 focus:type-label focus:text-carbon"
    >
      Skip to content
    </a>
  );
}
```

**File:** `src/layouts/components/DocumentTitle.tsx`

```tsx
import { matchPath, useLocation } from "react-router";

const TITLE_RULES = [
  { path: "/", title: "Wall" },
  { path: "/people", title: "People" },
  { path: "/notifications", title: "Alerts" },
  { path: "/profile", title: "You" },
  { path: "/profile/:userId", title: "Profile" },
  { path: "/settings", title: "Settings" },
  { path: "/post/:postId", title: "Post" },
  { path: "/auth/login", title: "Sign in" },
  { path: "/auth/register", title: "Join" },
  { path: "/__kit", title: "Kit" },
];

/** Per-route document title. React 19 hoists `<title>` into `<head>`. */
export function DocumentTitle() {
  const { pathname } = useLocation();
  const matched = TITLE_RULES.find((rule) => matchPath({ path: rule.path, end: true }, pathname));
  return <title>{`${matched?.title ?? "Not found"} · Aura`}</title>;
}
```

**File:** `src/layouts/components/RouteFallback.tsx`

```tsx
import { PeelLoader } from "@/shared/brand/PeelLoader";

/** While a route's code downloads: the brand loader, centred. */
export function RouteFallback() {
  return (
    <div className="grid min-h-[60dvh] place-items-center">
      <PeelLoader size={56} label="Loading page" />
    </div>
  );
}
```

- [ ] **Step 3: Error boundary**

**File:** `src/app/providers/AppErrorBoundary.tsx`

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Logo } from "@/shared/brand/Logo";
import { env } from "@/shared/config/env";
import { ErrorState } from "@/shared/kit/ErrorState";

interface AppErrorBoundaryState {
  error: Error | null;
}

/** A render crash shows the popped bubble and a reload, instead of a blank page. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (env.isDev) console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-dvh bg-ground text-ink">
        <header className="px-4 pt-4 sm:px-8 sm:pt-6">
          <Logo className="h-11 w-auto sm:h-12" />
        </header>
        <ErrorState
          level="page"
          title="Something popped"
          message="This screen stopped drawing. Nothing you wrote was lost — reloading usually fixes it."
          onRetry={() => window.location.reload()}
          retryLabel="Reload page"
        />
      </div>
    );
  }
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/layouts/components src/app/providers` → no errors.

```bash
git add src/layouts/components/Dock.tsx src/layouts/components/ShellHeader.tsx src/layouts/components/SkipLink.tsx src/layouts/components/DocumentTitle.tsx src/layouts/components/RouteFallback.tsx src/app/providers/AppErrorBoundary.tsx
git commit -m "Add the dock, shell header, skip link, titles, route fallback and error boundary"
```

---

### Task 2.5: Layouts, root gate and router

**Files:**
- Create: `src/layouts/RootLayout.tsx`, `src/layouts/GuestLayout.tsx`, `src/app/router/HomeGate.tsx`
- Modify (replace): `src/layouts/MainLayout.tsx`, `src/layouts/AuthLayout.tsx`, `src/app/router/router.tsx`, `src/app/providers/AppProviders.tsx`
- Delete: `src/layouts/components/CatalogueIndex.tsx`, `src/layouts/components/MobileDock.tsx`, `src/shared/ui/PageFallback.tsx`, `src/shared/ui/ErrorBoundary.tsx`, `src/shared/ui/FetchRule.tsx`, `src/shared/ui/DocumentTitle.tsx`

**Interfaces:**
- Produces:
  - `RootLayout` (the default export, used as the `/` route element)
  - `<MainLayout />` and `<GuestLayout />` (named exports)
  - `<HomeGate member guest />`

- [ ] **Step 1: Layouts**

**File:** `src/layouts/MainLayout.tsx`

```tsx
import { Outlet } from "react-router";
import { ComposerProvider } from "@/features/posts/composer/ComposerProvider";
import { Dock } from "./components/Dock";
import { ShellHeader } from "./components/ShellHeader";
import { SkipLink } from "./components/SkipLink";

/** The member shell: logo top-left, the page, and the dock. No top bar. */
export function MainLayout() {
  return (
    <ComposerProvider>
      <SkipLink />
      <ShellHeader />
      {/* overflow-x-clip: cards arrive tilted and scaled, and must not widen the page while they do. */}
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-(--page-max) overflow-x-clip px-4 pb-36 outline-none sm:px-8">
        <Outlet />
      </main>
      <Dock />
    </ComposerProvider>
  );
}
```

**File:** `src/layouts/GuestLayout.tsx`

```tsx
import { Outlet, useMatch } from "react-router";
import { ShellHeader } from "./components/ShellHeader";
import { SkipLink } from "./components/SkipLink";

/**
 * Signed-out visitors on app routes (the 404, for now). `/` renders bare —
 * the landing page (Phase 4) brings its own navigation.
 */
export function GuestLayout() {
  const isFrontDoor = useMatch({ path: "/", end: true });

  return (
    <>
      <SkipLink />
      {isFrontDoor ? null : <ShellHeader />}
      <main id="content" tabIndex={-1} className={isFrontDoor ? "outline-none" : "mx-auto w-full max-w-(--page-max) px-4 pb-16 outline-none sm:px-8"}>
        <Outlet />
      </main>
    </>
  );
}
```

**File:** `src/layouts/RootLayout.tsx`

```tsx
import { ScrollRestoration } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { DocumentTitle } from "./components/DocumentTitle";
import { GuestLayout } from "./GuestLayout";
import { MainLayout } from "./MainLayout";

/** Members get the dock shell; guests get the bare shell. */
export default function RootLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <DocumentTitle />
      <ScrollRestoration />
      {isAuthenticated ? <MainLayout /> : <GuestLayout />}
    </>
  );
}
```

**File:** `src/layouts/AuthLayout.tsx`

```tsx
import { Outlet, ScrollRestoration } from "react-router";
import { DocumentTitle } from "./components/DocumentTitle";
import { ShellHeader } from "./components/ShellHeader";
import { SkipLink } from "./components/SkipLink";

/** Shell for sign-in and sign-up: the logo, then the page. */
export default function AuthLayout() {
  return (
    <>
      <DocumentTitle />
      <ScrollRestoration />
      <SkipLink />
      <ShellHeader />
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-(--page-max) px-4 pb-16 outline-none sm:px-8">
        <Outlet />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Root gate and router**

**File:** `src/app/router/HomeGate.tsx`

```tsx
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** `/` is the wall for members and the front door for guests. */
export function HomeGate({ member, guest }: { member: ReactNode; guest: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return <>{isAuthenticated ? member : guest}</>;
}
```

**File:** `src/app/router/router.tsx`

```tsx
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "@/layouts/AuthLayout";
import RootLayout from "@/layouts/RootLayout";
import { RouteFallback } from "@/layouts/components/RouteFallback";
import { HomeGate } from "./HomeGate";
import { LegacyPostRedirect } from "./LegacyRedirect";
import { RequireAuth, RequireGuest } from "./RouteGuards";
import { routes } from "./routes";

/** Pages are code-split; each downloads when its route is first visited. */
const HomePage = lazy(() => import("@/pages/HomePage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const PeoplePage = lazy(() => import("@/pages/PeoplePage"));
const PostDetailsPage = lazy(() => import("@/pages/PostDetailsPage"));
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
/** Development-only design-system specimen page; compiled out of production builds. */
const KitPage = import.meta.env.DEV ? lazy(() => import("@/pages/kit/KitPage")) : null;

function lazyRoute(element: React.ReactNode) {
  return <Suspense fallback={<RouteFallback />}>{element}</Suspense>;
}

const devRoutes = KitPage ? [{ path: "/__kit", element: lazyRoute(<KitPage />) }] : [];

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: <RootLayout />,
    children: [
      // Members see the wall; guests go to sign-in until the landing page ships (Phase 4).
      { index: true, element: <HomeGate member={lazyRoute(<HomePage />)} guest={<Navigate to={routes.login} replace />} /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "profile", element: lazyRoute(<ProfilePage />) },
          { path: "profile/:userId", element: lazyRoute(<ProfilePage />) },
          { path: "settings", element: lazyRoute(<SettingsPage />) },
          { path: "notifications", element: lazyRoute(<NotificationsPage />) },
          { path: "people", element: lazyRoute(<PeoplePage />) },
          { path: "post/:postId", element: lazyRoute(<PostDetailsPage />) },

          // Kept so links created before the routes were lowercased still work.
          { path: "Setting", element: <Navigate to={routes.settings} replace /> },
          { path: "setting", element: <Navigate to={routes.settings} replace /> },
          { path: "PostDetails/:postId", element: <LegacyPostRedirect /> },
        ],
      },
      // Unknown paths render 404 for everyone, signed in or not.
      { path: "*", element: lazyRoute(<NotFoundPage />) },
    ],
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        element: <RequireGuest />,
        children: [
          { path: "login", element: lazyRoute(<LoginPage />) },
          { path: "register", element: lazyRoute(<RegisterPage />) },
        ],
      },
    ],
  },
  ...devRoutes,
]);
```

**File:** `src/app/providers/AppProviders.tsx`

```tsx
import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { ToastProvider } from "@/shared/kit/toast/ToastProvider";
import { ToastProvider as LegacyToastProvider } from "@/shared/ui/toast";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { AppErrorBoundary } from "./AppErrorBoundary";

/**
 * Provider stack for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation honour
 * `prefers-reduced-motion` by default; components still opt out of loops
 * through `useMotionPrefs()`. The legacy toast provider stays until Phase 3
 * moves every screen onto the kit's toasts.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <LegacyToastProvider>{children}</LegacyToastProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </AppErrorBoundary>
  );
}
```

- [ ] **Step 3: Remove the replaced shell files**

```bash
git rm -q src/layouts/components/CatalogueIndex.tsx src/layouts/components/MobileDock.tsx src/shared/ui/PageFallback.tsx src/shared/ui/ErrorBoundary.tsx src/shared/ui/FetchRule.tsx src/shared/ui/DocumentTitle.tsx
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck` → exit 0 (if an old file still imports a deleted module, the error names it; fix the import, don't restore the file). Run: `npx eslint src/layouts src/app src/shared/kit src/features/posts/composer src/features/posts/components/PostComposer.tsx` → no errors.

Browser, as a guest:
- `/` redirects to `/auth/login`, which shows the logo header.
- `/nope` shows the 404 with the logo header and no dock.
- `/__kit` renders.
- No console errors.

With a session (the user signs in themselves):
- The dock shows at 375 / 768 / 1280 / 1440: icon + 10px label on phones, icons + tooltip on tablets, icon + label from 1024.
- The active item sticker moves; the Alerts badge shows the unread count.
- Post opens the composer sheet (a bottom sheet at 375).
- Route changes peel (pane visible); the theme toggle peels on.
- Keyboard: the skip link appears on first Tab; the dock is reachable.

- [ ] **Step 5: Commit**

```bash
git add -A src/layouts src/app src/shared/ui
git commit -m "Replace the shell: dock, logo header, root gate, peel transitions"
```
