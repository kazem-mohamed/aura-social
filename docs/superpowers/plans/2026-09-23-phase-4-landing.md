# Aura Rebrand — Phase 4: Landing · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give guests the front door the spec locked (§9, §6, §10):
1. A marquee and a floating pill nav.
2. **Hero, "The slap":**
   - a Sky Wash wall, and `EVERYTHING HERE / BREATHES` set as a poster;
   - the five 3D objects and the logo slap on in sequence;
   - scrolling inflates the objects.
3. **How it feels:** a pinned sample post. Scrolling plays like → comment → save → share, each with its 3D object.
4. **Your sticker:** type a handle and see the live identity sticker. **Claim it** opens sign-up with the handle filled in.
5. **The wall:** the real features, as stickers that arrive as you scroll.
6. **Join:** a final call to action, and an honest footer.

Also in this phase:
- **Lenis** smooth scrolling, on the landing only.
- **Dock ↔ nav:** signing in carries the guest nav down into the dock. Signing out lands on the landing, and the dock travels back up into the nav, all inside one view transition.

**Architecture:**
- Landing sections live in `src/features/landing/` and are composed by `src/pages/LandingPage.tsx`. The page is lazy, so Lenis and its CSS stay in the landing chunk.
- `GuestNav` (`src/layouts/components/`) is the guest chrome for the landing, the auth pages and the guest 404. It carries `view-transition-name: dock`, the same name as the dock.
- `swapShell()` (`src/shared/lib/shellSwap.ts`) runs a shell change inside one view transition and marks it with `:root.shell-swap`. `transitions.css` animates the shared pill only under that class.

**Tech Stack:** React 19, React Router 7, framer-motion 12 (`useScroll`, `useTransform`, `useMotionValueEvent`, `useInView`), Lenis 1.3, Tailwind v4, View Transitions API.

**Spec:** `docs/superpowers/specs/2026-09-23-aura-sticker-rebrand-design.md` §6 (slap-in, breathe, scroll-linked, dock ↔ nav), §9 (landing), §10 (routing), §11 (LCP). **Depends on:** Phases 0–3.

## Global Constraints

- **The brief is pinned:** hero H2 and the five-section story. There is no concept roll. The world is the incumbent Aura system: tokens, kit, brand. No new colours, fonts or container styles.
- **Honest content:**
  - The only sample content is the pinned post and its names, and it carries a visible "Sample" label.
  - Features listed on the wall must exist today.
  - No numbers, testimonials or claims.
- **Reduced motion:** no slap-in, no breathing, no scroll inflation, no pinned story (it renders as a static finished state), and no Lenis.
- **Loops pause off-screen** (`useInView`).
- **LCP:** the hero bubble loads eagerly with high priority, and it is never hidden by an opacity-0 start.
- **Never** put Tailwind translate or rotate utilities on a Motion element.
- **Verification:**
  - `npm run typecheck`, `npm run lint`, `npm run build`.
  - Guest browser checks of `/` at 375 / 768 / 1280 / 1440 in both themes, with no sideways scroll and no console errors.
  - Claim it → register pre-fill.
  - `/auth/login` shows the guest nav.

---

### Task 4.1: The landing page

**Files:**
- Create: `src/layouts/components/GuestNav.tsx`, `src/app/router/landing.ts`, `src/app/router/LandingRoute.tsx`, `src/pages/LandingPage.tsx`
- Create in `src/features/landing/`: `useSmoothScroll.ts`, `usePosterLines.ts`, and in `components/`: `Breathe.tsx`, `Hero.tsx`, `SamplePost.tsx`, `HowItFeels.tsx`, `YourSticker.tsx`, `FeatureWall.tsx`, `JoinBand.tsx`, `LandingFooter.tsx`
- Modify: `src/shared/kit/Marquee.tsx` (a drawn sparkle sticker instead of the "✦" character), `src/layouts/GuestLayout.tsx` (the front door renders bare), `src/app/router/router.tsx` (guests get the landing)

- [ ] **Step 1: Guest nav, marquee separator, guest layout**

**File:** `src/layouts/components/GuestNav.tsx`

```tsx
import { Link, NavLink, useLocation } from "react-router";
import { Logo } from "@/shared/brand/Logo";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { cx } from "@/shared/kit/cx";
import { routes } from "@/app/router/routes";

const SECTIONS = [
  { hash: "#feel", label: "How it feels" },
  { hash: "#sticker", label: "Your sticker" },
];

/** Display is set per item: the section links only exist from `md` up. */
const ITEM = "h-10 items-center rounded-pill px-4 type-label transition-colors duration-200 hover:bg-action-ink/10";

/**
 * The guest pill: the dock's twin at the top of the screen. It carries the
 * dock's view-transition name, so signing in carries it down into the dock.
 */
export function GuestNav({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const onLanding = pathname === routes.home;

  return (
    <nav
      aria-label="Primary"
      className={cx(
        "sticky top-3 z-(--z-dock) mx-auto flex w-fit max-w-[calc(100%-24px)] items-center gap-1 rounded-pill border border-line bg-action p-1.5 text-action-ink [view-transition-name:dock]",
        className,
      )}
    >
      <Link to={routes.home} viewTransition aria-label="Aura — home" className="grid h-10 shrink-0 place-items-center rounded-pill px-1.5">
        <Logo title={null} className="h-8 w-auto" />
      </Link>
      {onLanding
        ? SECTIONS.map((section) => (
            <a key={section.hash} href={section.hash} className={cx(ITEM, "hidden md:inline-flex")}>
              {section.label}
            </a>
          ))
        : null}
      {/* NavLink marks itself aria-current="page" on the sign-in screen. */}
      <NavLink to={routes.login} viewTransition className={cx(ITEM, "inline-flex")}>
        Sign in
      </NavLink>
      <ButtonLink to={routes.register} viewTransition variant="sticker" fill="sun" size="sm" className="h-10">
        Join Aura
      </ButtonLink>
    </nav>
  );
}
```

**File:** `src/shared/kit/Marquee.tsx`

```tsx
import type { CSSProperties } from "react";
import { Sticker } from "@/shared/brand/Sticker";
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
          <Sticker name="sparkle" fill="var(--sun)" size={18} />
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

**File:** `src/layouts/GuestLayout.tsx`

```tsx
import { Outlet, useMatch } from "react-router";
import { GuestNav } from "./components/GuestNav";
import { SkipLink } from "./components/SkipLink";

/**
 * Signed-out visitors. The landing at `/` brings its own header, nav, main and
 * footer; every other guest page (the 404) gets the guest nav and a main.
 */
export function GuestLayout() {
  const isFrontDoor = useMatch({ path: "/", end: true });

  if (isFrontDoor) {
    return (
      <>
        <SkipLink />
        <Outlet />
      </>
    );
  }

  return (
    <>
      <SkipLink />
      <GuestNav className="mt-3" />
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-(--page-max) px-4 pb-16 outline-none sm:px-8">
        <Outlet />
      </main>
    </>
  );
}
```

- [ ] **Step 2: Landing hooks**

**File:** `src/features/landing/useSmoothScroll.ts`

```ts
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

/** Lenis on the landing only: made on mount, destroyed on unmount, never under reduced motion. */
export function useSmoothScroll() {
  const { reduced } = useMotionPrefs();

  useEffect(() => {
    if (reduced) return;
    // The offset keeps anchored sections clear of the sticky guest nav.
    const lenis = new Lenis({ autoRaf: true, anchors: { offset: -88 } });
    return () => lenis.destroy();
  }, [reduced]);
}
```

**File:** `src/features/landing/usePosterLines.ts`

```ts
import { useLayoutEffect, useRef } from "react";

/**
 * Poster setting: every `[data-line]` child is sized so it spans the box
 * exactly, capped at a share of the viewport height so the block always fits
 * the first screen. Re-fits on resize and once the web fonts arrive.
 * Lines need `display: block; width: max-content`.
 */
export function usePosterLines<T extends HTMLElement>(heightShare = 0.3) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const box = ref.current;
    if (!box) return;

    const fit = () => {
      const available = box.clientWidth;
      const cap = Math.max(40, window.innerHeight * heightShare);
      box.querySelectorAll<HTMLElement>("[data-line]").forEach((line) => {
        line.style.fontSize = "100px";
        const natural = line.scrollWidth;
        if (natural > 0 && available > 0) {
          line.style.fontSize = `${Math.min(cap, Math.floor((100 * available) / natural))}px`;
        }
      });
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    window.addEventListener("resize", fit);
    void document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [heightShare]);

  return ref;
}
```

- [ ] **Step 3: Breathing, the hero and the sample post**

**File:** `src/features/landing/components/Breathe.tsx`

```tsx
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { duration } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

interface BreatheProps {
  children: ReactNode;
  /** Seconds before the first breath — staggers neighbours. */
  delay?: number;
  /** How far it swells, as a share of its size. */
  amount?: number;
}

/** The landing's loop: an object swells and settles every 4.8 s — only while on screen, never under reduced motion. */
export function Breathe({ children, delay = 0, amount = 0.06 }: BreatheProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const { reduced } = useMotionPrefs();
  const breathing = inView && !reduced;

  return (
    <motion.div
      ref={ref}
      animate={breathing ? { scale: [1, 1 + amount, 1] } : { scale: 1 }}
      transition={breathing ? { duration: duration.breath, ease: "easeInOut", repeat: Infinity, delay } : { duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
```

**File:** `src/features/landing/components/Hero.tsx`

```tsx
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import type { ObjectName } from "@/assets/objects/manifest";
import { Logo } from "@/shared/brand/Logo";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { cx } from "@/shared/kit/cx";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { usePosterLines } from "../usePosterLines";
import { Breathe } from "./Breathe";

interface Slapped {
  name: ObjectName;
  /** Resting tilt in degrees. */
  tilt: number;
  /** How strongly scrolling inflates and lifts it. */
  depth: number;
  className: string;
  sizes: string;
}

/** Where each object lands on the wall, in the order it arrives. The bubble is the LCP image. */
const OBJECTS: Slapped[] = [
  { name: "bubble", tilt: -6, depth: 1, className: "left-[30%] top-[4%] w-[44%] lg:left-[38%] lg:top-0 lg:w-[26%]", sizes: "(min-width: 1024px) 26vw, 44vw" },
  { name: "heart", tilt: 9, depth: 0.7, className: "left-0 top-[30%] w-[30%] lg:left-[4%] lg:top-[18%] lg:w-[17%]", sizes: "(min-width: 1024px) 17vw, 30vw" },
  { name: "bookmark", tilt: -11, depth: 0.85, className: "right-0 top-[38%] w-[22%] lg:right-[16%] lg:top-[22%] lg:w-[12%]", sizes: "(min-width: 1024px) 12vw, 22vw" },
  { name: "share", tilt: 7, depth: 0.6, className: "left-[74%] top-0 w-[20%] lg:left-[66%] lg:top-[44%] lg:w-[14%]", sizes: "(min-width: 1024px) 14vw, 20vw" },
  { name: "bell", tilt: -5, depth: 0.9, className: "hidden lg:block lg:right-0 lg:top-0 lg:w-[13%]", sizes: "13vw" },
];

const LINES = [
  { text: "Everything here", className: "" },
  { text: "breathes", className: "sm:[font-stretch:124%]" },
];

function SlappedObject({ object, index, progress }: { object: Slapped; index: number; progress: MotionValue<number> }) {
  const { reduced } = useMotionPrefs();
  const y = useTransform(progress, [0, 1], [0, -140 * object.depth]);
  const scale = useTransform(progress, [0, 1], [1, 1 + 0.3 * object.depth]);
  const isAnchor = index === 0;

  return (
    <motion.div aria-hidden className={cx("absolute", object.className)} style={reduced ? undefined : { y, scale }}>
      <motion.div
        // The anchor never starts invisible: it is the largest paint on the page.
        initial={reduced ? false : { scale: 1.35, rotate: object.tilt - 14, opacity: isAnchor ? 1 : 0 }}
        animate={{ scale: 1, rotate: object.tilt, opacity: 1 }}
        transition={{ ...spring.release, delay: 0.15 + index * 0.12 }}
      >
        <Breathe delay={index * 0.6}>
          <ObjectArt name={object.name} sizes={object.sizes} priority={isAnchor} />
        </Breathe>
      </motion.div>
    </motion.div>
  );
}

/**
 * The slap: an empty sky wall, then the objects and the logo slap onto it one
 * after another above a two-line poster. Scrolling away inflates them.
 */
export function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = usePosterLines<HTMLHeadingElement>();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  return (
    <section ref={heroRef} aria-labelledby="hero-title" className="relative overflow-hidden bg-band-sky">
      <div className="mx-auto grid max-w-(--page-max) grid-cols-[minmax(0,1fr)] px-4 pt-20 pb-12 sm:px-8 sm:pt-24 sm:pb-16">
        <div className="relative h-[190px] sm:h-[260px] lg:h-[300px]">
          {OBJECTS.map((object, index) => (
            <SlappedObject key={object.name} object={object} index={index} progress={scrollYProgress} />
          ))}
          <div className="absolute -bottom-[6%] left-[4%] z-10 w-[42%] sm:w-[30%] lg:-bottom-[8%] lg:left-[18%] lg:w-[20%]">
            <Logo slapIn interactive title={null} className="h-auto w-full" />
          </div>
        </div>

        <h1
          id="hero-title"
          ref={titleRef}
          className="relative z-[5] grid grid-cols-[minmax(0,1fr)] font-display leading-[0.8] font-black tracking-[-0.01em] uppercase"
        >
          {LINES.map((line, index) => (
            <motion.span
              key={line.text}
              data-line
              className={cx("block w-max origin-bottom-left", line.className)}
              initial={{ scaleY: 0.7 }}
              animate={{ scaleY: 1 }}
              transition={{ ...spring.release, delay: 0.05 + index * 0.1 }}
            >
              {line.text}
            </motion.span>
          ))}
        </h1>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 sm:mt-10">
          <p className="max-w-[44ch] type-body-lg">
            Aura is a social wall where every like inflates, every save sticks and every follow peels.{" "}
            <span className="font-bold">Your sticker is already waiting.</span>
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink to={routes.register} viewTransition variant="sticker" fill="sun" size="lg" iconEnd="arrow-right">
              Join Aura
            </ButtonLink>
            <ButtonLink to={routes.login} viewTransition variant="secondary" size="lg">
              Sign in
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**File:** `src/features/landing/components/SamplePost.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { CommentButton, LikeButton, SaveButton, ShareButton } from "@/shared/kit/ActionButtons";
import { Avatar } from "@/shared/kit/Avatar";
import { spring } from "@/shared/motion/tokens";

interface SamplePostProps {
  liked: boolean;
  commented: boolean;
  saved: boolean;
  shared: boolean;
}

const noop = () => {};

/** The pinned demo post. Its state comes from the scroll, so its controls are inert. */
export function SamplePost({ liked, commented, saved, shared }: SamplePostProps) {
  return (
    <article aria-label="Sample post" className="relative grid gap-4 rounded-card border border-line bg-surface p-5 sm:p-6">
      <span className="absolute -top-3 left-5 rounded-pill border border-carbon bg-sun px-2.5 py-1 type-label text-carbon">Sample</span>
      <header className="flex items-center gap-3">
        <Avatar identityKey="mira.sol" name="Mira Sol" />
        <p className="grid gap-0.5">
          <span className="text-[16px] leading-tight font-bold">Mira Sol</span>
          <span className="type-caption text-ink-2">@mira.sol · 3m</span>
        </p>
      </header>
      <p className="type-heading-sm">First sticker on the wall. It’s mint, and it’s mine.</p>

      <div inert className="-mx-2.5 -mb-1.5 flex items-center gap-1">
        <LikeButton liked={liked} count={128 + (liked ? 1 : 0)} onToggle={noop} />
        <CommentButton count={14 + (commented ? 1 : 0)} onClick={noop} />
        <ShareButton count={3 + (shared ? 1 : 0)} onClick={noop} />
        <div className="ml-auto">
          <SaveButton saved={saved} onToggle={noop} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {commented ? (
          <motion.div
            key="comment"
            className="flex items-start gap-3 rounded-chip bg-surface-2 p-3.5"
            initial={{ opacity: 0, y: -12, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={spring.release}
          >
            <Avatar identityKey="idris.okafor" name="Idris Okafor" size="sm" />
            <p className="type-body">
              <span className="font-bold">Idris Okafor</span> <span className="text-ink-2">Mint suits you. Mine came out ember.</span>
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {shared ? (
          <motion.p
            key="shared"
            className="justify-self-start rounded-pill border border-carbon bg-mint px-3.5 py-1.5 type-label text-carbon"
            initial={{ opacity: 0, y: 26, rotate: -7 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={spring.release}
          >
            Shared to your wall
          </motion.p>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
```

- [ ] **Step 4: How it feels**

**File:** `src/features/landing/components/HowItFeels.tsx`

```tsx
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useRef, useState } from "react";
import type { ObjectName } from "@/assets/objects/manifest";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { cx } from "@/shared/kit/cx";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { Breathe } from "./Breathe";
import { SamplePost } from "./SamplePost";

interface Step {
  key: string;
  chip: string;
  verb: string;
  result: string;
  object: ObjectName;
}

const STEPS: Step[] = [
  { key: "like", chip: "Like", verb: "Like it.", result: "It inflates.", object: "heart" },
  { key: "comment", chip: "Comment", verb: "Say something.", result: "It gets volume.", object: "bubble" },
  { key: "save", chip: "Save", verb: "Save it.", result: "It sticks.", object: "bookmark" },
  { key: "share", chip: "Share", verb: "Share it.", result: "It goes round.", object: "share" },
];

const LAST = STEPS.length - 1;

/** Scroll progress through the pinned section → which step has happened (−1 = nothing yet). */
function stepAt(progress: number): number {
  return Math.min(LAST, Math.max(-1, Math.floor(progress * (STEPS.length + 0.4) - 0.2)));
}

/**
 * The pinned demo: one sample post, and scrolling does to it what a person
 * would — like, comment, save, share — each answered by its own object.
 * Under reduced motion it is not pinned and shows the finished state.
 */
export function HowItFeels() {
  const ref = useRef<HTMLElement>(null);
  const { reduced } = useMotionPrefs();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [step, setStep] = useState(-1);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = stepAt(value);
    setStep((current) => (current === next ? current : next));
  });

  const shown = reduced ? LAST : step;
  const current = shown >= 0 ? STEPS[shown] : null;

  return (
    <section id="feel" ref={ref} aria-labelledby="feel-title" className={cx("relative scroll-mt-24 bg-ground", !reduced && "h-[360vh]")}>
      <div
        className={cx(
          "mx-auto grid max-w-(--page-max) content-center gap-8 px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16",
          reduced ? "py-24" : "sticky top-0 h-dvh pt-24 pb-8",
        )}
      >
        <div className="grid content-start gap-5 lg:gap-10">
          <h2 id="feel-title" className="type-display text-balance">
            How it feels
          </h2>
          <ol className="flex flex-wrap gap-2 lg:grid lg:gap-5">
            {STEPS.map((item, index) => (
              <li
                key={item.key}
                aria-current={index === shown ? "step" : undefined}
                className={cx(
                  "rounded-pill border border-line px-3.5 py-1.5 type-label transition-colors duration-300",
                  "lg:rounded-none lg:border-0 lg:p-0 lg:tracking-normal lg:normal-case",
                  index === shown ? "bg-action text-action-ink lg:bg-transparent lg:text-ink" : "text-ink-2 lg:text-ink-3",
                )}
              >
                <span className="lg:hidden">{item.chip}</span>
                <span className="hidden lg:grid lg:gap-1">
                  <span className="type-heading">{item.verb}</span>
                  <span className="type-body-lg">{item.result}</span>
                </span>
              </li>
            ))}
          </ol>
          <p aria-hidden className="type-heading-sm lg:hidden">
            {current ? `${current.verb} ${current.result}` : "Scroll, and watch it react."}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div aria-hidden className="absolute -top-12 -right-3 z-10 w-[34%] sm:-right-10 lg:-top-28 lg:-right-20 lg:w-[44%]">
            <AnimatePresence mode="popLayout" initial={false}>
              {current ? (
                <motion.div
                  key={current.key}
                  initial={{ scale: 0.4, rotate: -24, opacity: 0 }}
                  animate={{ scale: 1, rotate: -6, opacity: 1 }}
                  exit={{ scale: 0.6, rotate: 14, opacity: 0, transition: { duration: 0.2 } }}
                  transition={spring.release}
                >
                  <Breathe>
                    <ObjectArt name={current.object} sizes="(min-width: 1024px) 240px, 34vw" />
                  </Breathe>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
          <SamplePost liked={shown >= 0} commented={shown >= 1} saved={shown >= 2} shared={shown >= 3} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Your sticker, the wall, join, footer**

**File:** `src/features/landing/components/YourSticker.tsx`

```tsx
import { useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { identityFor } from "@/shared/brand/identity";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { Button } from "@/shared/kit/Button";
import { Field } from "@/shared/kit/Field";
import { routes } from "@/app/router/routes";
import { IdentityPreview } from "@/features/auth/components/IdentityPreview";

/** Usernames are capped at 15 characters by the API. */
const MAX_HANDLE = 15;

/** Type a username, watch it turn into a sticker, and take it to sign-up. */
export function YourSticker() {
  const navigate = useNavigate();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const fieldRef = useRef<HTMLInputElement>(null);
  const [handle, setHandle] = useState("");
  const clean = handle.trim().replace(/^@/, "");
  const identity = identityFor(clean || "you");

  const claim = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Nothing typed yet: the button points you at the field instead of greying out.
    if (!clean) {
      fieldRef.current?.focus();
      return;
    }
    navigate(routes.register, { state: { handle: clean }, viewTransition: true });
  };

  return (
    <section id="sticker" aria-labelledby="sticker-title" className="scroll-mt-24 bg-band-lav">
      <div className="mx-auto grid max-w-(--page-max) items-center gap-12 px-4 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="grid gap-8">
          <h2 id="sticker-title" className="type-display text-balance">
            Nobody picks yours
          </h2>
          <p className="max-w-[46ch] type-body-lg">
            Type a username. Aura turns it into a sticker — one colour, one shape, one tilt — and it follows you everywhere: your
            posts, your comments, your profile.
          </p>
          <form onSubmit={claim} aria-label="Try a username" className="grid max-w-md gap-4">
            <Field
              ref={fieldRef}
              label="Try a username"
              iconStart="at"
              placeholder="your.handle"
              value={handle}
              maxLength={MAX_HANDLE}
              counter={{ value: handle.length, max: MAX_HANDLE }}
              ringColor={identity.color.hex}
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => setHandle(event.target.value)}
            />
            <Button type="submit" variant="sticker" fill="sun" size="lg" iconEnd="arrow-right" className="justify-self-start">
              Claim it
            </Button>
          </form>
        </div>
        <figure className="grid justify-items-center gap-5">
          {/* Until something is typed, the sticker is a question: which one is yours? */}
          <IdentityPreview username={clean} name={clean || "?"} size={isWide ? 340 : 220} />
          <figcaption className="text-center type-body">
            <span className="font-bold capitalize">
              {identity.color.name} · {identity.shape}
            </span>
            <span className="block text-ink-2">{clean ? `@${clean}` : "Start typing to see yours."}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
```

**File:** `src/features/landing/components/FeatureWall.tsx`

```tsx
import { motion } from "framer-motion";
import { Glyph } from "@/shared/brand/Glyph";
import type { GlyphName } from "@/shared/brand/glyphPaths";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";

type Mark = { sticker: StickerName } | { glyph: GlyphName };

interface Feature {
  title: string;
  line: string;
  mark: Mark;
  fill: string;
  ink?: string;
  tilt: number;
}

/** Only what works today. Each one is a sticker slapped on the wall. */
const FEATURES: Feature[] = [
  { title: "Four rooms", line: "Everyone, Following, Yours and Saved.", mark: { glyph: "wall" }, fill: "var(--sky)", tilt: -3 },
  { title: "Words or a picture", line: "Post text, one image, or both.", mark: { glyph: "image" }, fill: "var(--sun)", tilt: 4 },
  { title: "Likes that inflate", line: "Tap the heart and it swells.", mark: { sticker: "heart" }, fill: "var(--ember)", tilt: -5 },
  { title: "Comments and replies", line: "Threads that stay readable.", mark: { sticker: "bubble" }, fill: "var(--blue)", tilt: 2 },
  { title: "Share with a line", line: "Pass a post on, with your caption on top.", mark: { sticker: "share" }, fill: "var(--violet)", ink: "var(--paper)", tilt: -2 },
  { title: "Save for later", line: "Keep a post to read again.", mark: { sticker: "bookmark" }, fill: "var(--mint)", tilt: 5 },
  { title: "Follow people", line: "Their posts land on your wall.", mark: { glyph: "people" }, fill: "var(--lavender)", tilt: -4 },
  { title: "Alerts in one list", line: "Likes, comments, shares and follows.", mark: { sticker: "bell" }, fill: "var(--sun)", tilt: 3 },
  { title: "Your photo, framed", line: "Crop it right in the app.", mark: { glyph: "camera" }, fill: "var(--concrete)", tilt: -2 },
  { title: "Night paper", line: "A dark theme, designed — not inverted.", mark: { glyph: "moon" }, fill: "var(--night)", ink: "var(--bone)", tilt: 4 },
];

/** The wall: every real feature as a bumper sticker, arriving as it scrolls into view. */
export function FeatureWall() {
  const { reduced } = useMotionPrefs();

  return (
    <section id="wall" aria-labelledby="wall-title" className="scroll-mt-24 bg-ground">
      <div className="mx-auto grid max-w-(--page-max) justify-items-center gap-12 px-4 py-20 sm:px-8 sm:py-28">
        <div className="grid justify-items-center gap-5 text-center">
          <h2 id="wall-title" className="type-display text-balance">
            What’s on the wall
          </h2>
          <p className="max-w-[44ch] type-body-lg text-ink-2">All of it works today. No roadmap, no promises — just the wall.</p>
        </div>
        <ul className="flex max-w-[1100px] flex-wrap justify-center gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-7">
          {FEATURES.map((feature, index) => (
            <motion.li
              key={feature.title}
              initial={reduced ? false : { opacity: 0, y: -18, rotate: feature.tilt * 1.8, scale: 1.06 }}
              whileInView={{ opacity: 1, y: 0, rotate: feature.tilt, scale: 1 }}
              whileHover={reduced ? undefined : { y: -4, rotate: feature.tilt - 2 }}
              viewport={{ once: true, margin: "0px 0px -12% 0px" }}
              transition={{ ...spring.arrive, delay: (index % 5) * 0.07 }}
              style={reduced ? { rotate: feature.tilt } : undefined}
            >
              <div
                className="flex max-w-[min(22rem,calc(100vw-56px))] items-center gap-4 rounded-pill border border-line py-3 pr-6 pl-3"
                style={{ background: feature.fill, color: feature.ink ?? "var(--carbon)" }}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-carbon bg-paper text-carbon">
                  {"sticker" in feature.mark ? (
                    <Sticker name={feature.mark.sticker} fill={feature.fill} size={30} />
                  ) : (
                    <Glyph name={feature.mark.glyph} size={24} />
                  )}
                </span>
                <span className="grid gap-0.5">
                  <span className="text-[17px] leading-tight font-bold">{feature.title}</span>
                  <span className="type-caption">{feature.line}</span>
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

**File:** `src/features/landing/components/JoinBand.tsx`

```tsx
import { motion, transform, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router";
import type { ObjectName } from "@/assets/objects/manifest";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { cx } from "@/shared/kit/cx";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { usePosterLines } from "../usePosterLines";
import { Breathe } from "./Breathe";

/** How full of breath an object is over the band's arrival. */
const fill = transform([0.45, 0.8], [0, 1]);

interface InflatingProps {
  /** The deflated render it starts as. */
  flat: ObjectName;
  /** The inflated render it becomes. */
  full: ObjectName;
  progress: MotionValue<number>;
  tilt: number;
  delay?: number;
  sizes: string;
  className: string;
}

/**
 * The brand's idea, played once: an object lies deflated, and as the band
 * arrives it fills with breath — the flat render gives way to the full one.
 * Under reduced motion it is simply inflated.
 */
function Inflating({ flat, full, progress, tilt, delay = 0, sizes, className }: InflatingProps) {
  const { reduced } = useMotionPrefs();
  const scale = useTransform(progress, [0, 1], [0.8, 1]);
  // Function transforms stay on the JS path: framer 12.34 hands a range-mapped
  // opacity to a native scroll timeline that follows the page, not this band.
  const fullOpacity = useTransform(progress, fill);
  const flatOpacity = useTransform(progress, (p) => 1 - fill(p));

  return (
    <motion.div aria-hidden className={cx("absolute", className)} style={reduced ? { rotate: tilt } : { scale, rotate: tilt }}>
      <Breathe delay={delay}>
        <div className="grid">
          {reduced ? null : (
            // The deflated render sits low, like a balloon on the floor.
            <motion.div className="col-start-1 row-start-1 self-end" style={{ opacity: flatOpacity }}>
              <ObjectArt name={flat} sizes={sizes} />
            </motion.div>
          )}
          <motion.div className="col-start-1 row-start-1" style={reduced ? undefined : { opacity: fullOpacity }}>
            <ObjectArt name={full} sizes={sizes} />
          </motion.div>
        </div>
      </Breathe>
    </motion.div>
  );
}

/** The close: a Sunburst band, a two-line poster, and the way in. Its objects fill with breath as it arrives. */
export function JoinBand() {
  const ref = useRef<HTMLElement>(null);
  const titleRef = usePosterLines<HTMLHeadingElement>(0.22);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });

  return (
    <section ref={ref} aria-labelledby="join-title" className="relative overflow-hidden bg-sun text-carbon">
      <Inflating
        flat="bookmark-deflated"
        full="bookmark"
        progress={scrollYProgress}
        tilt={-12}
        sizes="240px"
        className="-top-6 -left-6 w-[26%] max-w-[240px] sm:w-[18%]"
      />
      <Inflating
        flat="bubble-deflated"
        full="bubble"
        progress={scrollYProgress}
        tilt={10}
        delay={1.2}
        sizes="340px"
        className="-right-8 -bottom-10 w-[38%] max-w-[340px] sm:w-[26%]"
      />

      <div className="relative mx-auto grid max-w-(--page-max) grid-cols-[minmax(0,1fr)] justify-items-center gap-8 px-4 py-28 text-center sm:px-8 sm:py-36">
        <h2
          id="join-title"
          ref={titleRef}
          className="grid w-full grid-cols-[minmax(0,1fr)] justify-items-center font-display leading-[0.8] font-black tracking-[-0.01em] uppercase [font-stretch:124%]"
        >
          {/* Two lines, each fitted: one line of it was too small to close on a phone. */}
          <span data-line className="block w-max">
            Stick
          </span>
          <span data-line className="block w-max">
            around
          </span>
        </h2>
        <p className="max-w-[40ch] type-body-lg">Pick a username, get your sticker, and put something on the wall.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <ButtonLink to={routes.register} viewTransition variant="sticker" fill="violet" size="lg" iconEnd="arrow-right">
            Join Aura
          </ButtonLink>
          <Link to={routes.login} viewTransition className="type-label underline decoration-1 underline-offset-4">
            I already have a sticker
          </Link>
        </div>
      </div>
    </section>
  );
}
```

**File:** `src/features/landing/components/LandingFooter.tsx`

```tsx
import type { MouseEvent } from "react";
import { Link } from "react-router";
import { Glyph } from "@/shared/brand/Glyph";
import { Logo } from "@/shared/brand/Logo";
import { useTheme } from "@/shared/lib/useTheme";
import { routes } from "@/app/router/routes";

const PILL =
  "inline-flex h-11 items-center gap-2 rounded-pill border border-action-ink/40 px-4 type-label transition-colors duration-200 hover:bg-action-ink/10";

/** The honest footer: what this is, and the ways in. */
export function LandingFooter() {
  const { theme, toggle } = useTheme();

  const switchPaper = (event: MouseEvent<HTMLButtonElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    toggle({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
  };

  return (
    <footer className="bg-action text-action-ink">
      <div className="mx-auto grid max-w-(--page-max) gap-8 px-4 py-12 sm:px-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-12">
        <Logo title="Aura" className="h-12 w-auto" />
        <p className="max-w-[56ch] type-body">
          A portfolio project built on the Route Academy practice API. The post and the names on this page are samples.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Link to={routes.login} viewTransition className={PILL}>
            Sign in
          </Link>
          <Link to={routes.register} viewTransition className={PILL}>
            Join
          </Link>
          <button type="button" onClick={switchPaper} aria-pressed={theme === "dark"} className={PILL}>
            <Glyph name="moon" size={18} />
            Night paper
          </button>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: The page and the route**

**File:** `src/app/router/landing.ts`

```ts
type LandingModule = typeof import("@/pages/LandingPage");

let loaded: LandingModule | undefined;

/** The landing chunk. Shared by the router and by sign-out, which warms it before swapping the shell. */
export const loadLandingPage = () => import("@/pages/LandingPage").then((module) => (loaded = module));

/** The landing page once its chunk has arrived, so it can render without suspending. */
export const loadedLandingPage = () => loaded?.default;
```

**File:** `src/pages/LandingPage.tsx`

```tsx
import { Marquee } from "@/shared/kit/Marquee";
import { GuestNav } from "@/layouts/components/GuestNav";
import { FeatureWall } from "@/features/landing/components/FeatureWall";
import { Hero } from "@/features/landing/components/Hero";
import { HowItFeels } from "@/features/landing/components/HowItFeels";
import { JoinBand } from "@/features/landing/components/JoinBand";
import { LandingFooter } from "@/features/landing/components/LandingFooter";
import { YourSticker } from "@/features/landing/components/YourSticker";
import { useSmoothScroll } from "@/features/landing/useSmoothScroll";

const TICKER = [
  "Everything here breathes",
  "Like it and it inflates",
  "Save it and it sticks",
  "Follow and it peels",
  "Empty just means waiting for breath",
];

/** The front door for guests: the slap, how it feels, your sticker, the wall, and the way in. */
export default function LandingPage() {
  useSmoothScroll();

  return (
    <div data-landing>
      <header>
        <Marquee items={TICKER} />
      </header>
      {/* The nav floats over the hero's sky, so it takes no room of its own. */}
      <GuestNav className="mt-3 -mb-16" />
      {/* overflow-x-clip: stickers arrive tilted and must not widen the page. It is not a scroll container, so the pinned section still sticks. */}
      <main id="content" tabIndex={-1} className="overflow-x-clip outline-none">
        <Hero />
        <HowItFeels />
        <YourSticker />
        <FeatureWall />
        <JoinBand />
      </main>
      <LandingFooter />
    </div>
  );
}
```

**File:** `src/app/router/LandingRoute.tsx`

```tsx
import { lazy, Suspense, useState } from "react";
import { RouteFallback } from "@/layouts/components/RouteFallback";
import { loadedLandingPage, loadLandingPage } from "./landing";

const LandingPage = lazy(loadLandingPage);

/**
 * The front door. Once sign-out has warmed its code it renders directly: as a
 * lazy page it would suspend under the fresh guest shell, show its fallback,
 * and React holds a fallback for 300ms before revealing what replaces it.
 */
export function LandingRoute() {
  const [Loaded] = useState(() => loadedLandingPage());
  if (Loaded) return <Loaded />;
  return (
    <Suspense fallback={<RouteFallback />}>
      <LandingPage />
    </Suspense>
  );
}
```

In `src/app/router/router.tsx`:
- Add `import { LandingRoute } from "./LandingRoute";`.
- Change the index route's guest element from `<Navigate to={routes.login} replace />` to `<LandingRoute />`.
- Replace the comment above it with `// Members see the wall; guests get the landing.`

- [ ] **Step 7: Verify and commit**

```bash
npm run typecheck
npx eslint src/features/landing src/pages/LandingPage.tsx src/layouts src/shared/kit/Marquee.tsx src/app/router
git commit -m "Add the landing: the slap, how it feels, your sticker, the wall and the join band"
```

---

### Task 4.2: Dock ↔ nav, and signing out onto the landing

**Files:**
- Create: `src/shared/lib/shellSwap.ts`, `src/features/auth/hooks/useSignOut.ts`
- Modify:
  - `src/styles/transitions.css`: shared-pill rules.
  - `src/app/router/RouteGuards.tsx`: `RequireGuest` leaves through a view transition.
  - `src/layouts/components/Dock.tsx`: no slide-in when the dock arrives from the nav.
  - `src/layouts/AuthLayout.tsx`: the guest nav replaces the logo header.
  - `src/layouts/components/DocumentTitle.tsx`: the guest title for `/`.
  - `src/pages/SettingsPage.tsx` and `src/features/users/components/profile/OwnProfileActions.tsx`: use `useSignOut`.

- [ ] **Step 1: The swap**

**File:** `src/shared/lib/shellSwap.ts`

```ts
const SWAP_CLASS = "shell-swap";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Signing in or out swaps the whole shell. Run inside one view transition,
 * the guest nav and the dock — both named `dock` — travel into each other:
 * the pill peels off one edge of the screen and slaps back on at the other.
 * `update` may be async; the new state is captured once it resolves.
 */
export async function swapShell(update: () => void | Promise<void>): Promise<void> {
  if (!document.startViewTransition || prefersReducedMotion()) {
    await update();
    return;
  }

  const root = document.documentElement;
  root.classList.add(SWAP_CLASS);
  const transition = document.startViewTransition(async () => {
    await update();
  });

  // An interrupted transition rejects its promises; the DOM update happens regardless.
  const ignore = () => {};
  transition.ready.catch(ignore);
  await transition.updateCallbackDone.catch(ignore);
  void transition.finished.catch(ignore).finally(() => root.classList.remove(SWAP_CLASS));
}

/** For a transition React Router starts itself: mark it as a shell swap while it runs. */
export function markShellSwap(forMs = 1200): void {
  const root = document.documentElement;
  root.classList.add(SWAP_CLASS);
  window.setTimeout(() => root.classList.remove(SWAP_CLASS), forMs);
}
```

**File:** `src/features/auth/hooks/useSignOut.ts`

```ts
import { flushSync } from "react-dom";
import { useNavigate } from "react-router";
import { useToast } from "@/shared/kit/toast/useToast";
import { swapShell } from "@/shared/lib/shellSwap";
import { loadLandingPage } from "@/app/router/landing";
import { routes } from "@/app/router/routes";
import { useAuth } from "./useAuth";

/** Resolves once `selector` is in the document, or after `timeout` ms regardless. */
function whenPresent(selector: string, timeout = 1000): Promise<void> {
  return new Promise((resolve) => {
    const started = performance.now();
    const check = () => {
      if (document.querySelector(selector) || performance.now() - started > timeout) resolve();
      else window.setTimeout(check, 16);
    };
    check();
  });
}

/**
 * Sign out onto the front door. Inside one view transition the page moves to
 * `/`, the session ends and the landing renders — so the dock peels up into
 * the landing's nav instead of the screen simply changing.
 */
export function useSignOut() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  return async () => {
    // Warm the landing chunk first, so it is ready inside the transition.
    await loadLandingPage().catch(() => undefined);
    await swapShell(async () => {
      // The router commits navigations in a transition; without `flushSync` the
      // session ends while the page is still a member route, and the auth guard
      // sends you to sign-in instead of the front door.
      await navigate(routes.home, { replace: true, flushSync: true });
      flushSync(signOut);
      await whenPresent("[data-landing]");
    });
    toast.show({ title: "Signed out. See you soon." });
  };
}
```

In `src/pages/SettingsPage.tsx`:
- Replace `import { useAuth } from "@/features/auth/hooks/useAuth";` with `import { useSignOut } from "@/features/auth/hooks/useSignOut";`.
- Replace `const { signOut } = useAuth();` with `const signOut = useSignOut();`.
- Remove the `leave` function and `toast` (the hook shows the toast), and remove the `useToast` import.
- Set the button's handler to `onClick={() => void signOut()}`.

In `src/features/users/components/profile/OwnProfileActions.tsx`:
- Import `useSignOut` instead of `useAuth` and `useToast`.
- Use `const signOut = useSignOut();`.
- Set the "Sign out" item's handler to `onSelect: () => void signOut()`.

- [ ] **Step 2: Sign-in leaves through a transition; the dock skips its slide-in**

**File:** `src/app/router/RouteGuards.tsx`

```tsx
import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { markShellSwap } from "@/shared/lib/shellSwap";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { routes } from "./routes";

/**
 * Guards now read the session from `AuthProvider` instead of reading
 * `localStorage` during render, so signing out redirects immediately rather
 * than waiting for the next manual navigation.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={routes.login} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

/**
 * Keeps signed-in users out of the sign-in and sign-up screens. The move to
 * the wall is a view transition marked as a shell swap, so the guest nav
 * travels down into the dock.
 */
export function RequireGuest() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    markShellSwap();
    void navigate(routes.home, { replace: true, viewTransition: true });
  }, [isAuthenticated, navigate]);

  return <Outlet />;
}
```

In `src/layouts/components/Dock.tsx`:
- Add `useState` to the React import (add `import { useState } from "react";`).
- At the top of `Dock()`, add:

```tsx
  // Arriving through a sign-in, the dock travels from the guest nav instead of sliding up.
  const [slidesIn] = useState(() => !document.documentElement.classList.contains("shell-swap"));
```

- Replace the `<nav>`'s `className="dock-enter fixed …"` with `className={cx(slidesIn && "dock-enter", "fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-1/2 z-(--z-dock) -translate-x-1/2 [view-transition-name:dock]")}`.

- [ ] **Step 3: The shared pill in CSS**

In `src/styles/transitions.css`:
- Delete the rule `::view-transition-group(dock) { animation: none; }`. The dock sits in the same place on every member page, so its default group animation moves nothing. Keep the `old` and `new` rules.
- Add the following after the dock rules:

```css
/* Signing in or out: the guest nav and the dock share the name, so the pill
   travels between the top and the bottom of the screen — it peels off one
   edge and slaps back on at the other. */
:root.shell-swap::view-transition-group(dock) {
  animation-duration: 640ms;
  animation-timing-function: var(--ease-spring-css);
}
:root.shell-swap::view-transition-old(dock) {
  display: block;
  animation: vt-pill-off 260ms var(--ease-out-css) both;
}
:root.shell-swap::view-transition-new(dock) {
  animation: vt-pill-on 520ms 120ms var(--ease-spring-css) both;
}
@keyframes vt-pill-off {
  to {
    opacity: 0;
    transform: rotate(-3deg) scale(0.96);
  }
}
@keyframes vt-pill-on {
  from {
    opacity: 0;
    transform: rotate(3deg) scale(1.08);
  }
}
```

In the `@media (prefers-reduced-motion: reduce)` block, add `::view-transition-group(dock), :root.shell-swap::view-transition-old(dock), :root.shell-swap::view-transition-new(dock)` to the selector list that sets `animation: none !important`.

- [ ] **Step 4: Guest chrome on the auth pages, and the guest title**

**File:** `src/layouts/AuthLayout.tsx`

```tsx
import { Outlet, ScrollRestoration } from "react-router";
import { DocumentTitle } from "./components/DocumentTitle";
import { GuestNav } from "./components/GuestNav";
import { SkipLink } from "./components/SkipLink";

/** Shell for sign-in and sign-up: the guest nav, then the page. */
export default function AuthLayout() {
  return (
    <>
      <DocumentTitle />
      <ScrollRestoration />
      <SkipLink />
      <GuestNav className="mt-3" />
      <main id="content" tabIndex={-1} className="mx-auto w-full max-w-(--page-max) px-4 pb-16 outline-none sm:px-8">
        <Outlet />
      </main>
    </>
  );
}
```

**File:** `src/layouts/components/DocumentTitle.tsx`

```tsx
import { matchPath, useLocation } from "react-router";
import { useAuth } from "@/features/auth/hooks/useAuth";

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
  const { isAuthenticated } = useAuth();

  // Guests at `/` are on the front door, which carries the brand line.
  if (pathname === "/" && !isAuthenticated) return <title>Aura — Everything here breathes</title>;

  const matched = TITLE_RULES.find((rule) => matchPath({ path: rule.path, end: true }, pathname));
  return <title>{`${matched?.title ?? "Not found"} · Aura`}</title>;
}
```

- [ ] **Step 5: Verify and commit**

```bash
npm run typecheck
npm run lint
git commit -m "Carry the guest nav into the dock on sign-in and back on sign-out"
```

Browser, as a guest:
- `/auth/login` shows the guest nav.
- The dock doesn't render for guests.
- The title of `/` is "Aura — Everything here breathes".
- The sign-in → dock morph and sign-out → landing need the user's own session. The user checks them.

---

### Task 4.3: Design contract and landing verification

**Files:**
- Modify: `index.html`. Add the direction contract as the first child of `<body>`, so it survives the build.

- [ ] **Step 1: The contract comment**

In `index.html`, directly after `<body>`:

```html
    <!--
      THESIS: Aura's front door is a poster wall you watch come alive: stickers and inflated objects slap onto an empty sky, and every action you'll take here is played out before you sign up. It refuses the category default of a screenshot hero and feature cards.
      OWN-WORLD: Paper and Night-paper grounds, Sky/Lavender/Sunburst bands, 1px carbon outlines, crushed Anybody 900 poster type, Onest UI, pill controls, six sticker colours, inflated 3D action objects, no shadows or gradients.
      STORY: See it breathe → feel a like, comment, save and share on a sample post → turn your username into your sticker → see everything that works → join.
      FIRST VIEWPORT: marquee; floating ink pill nav; sky wall with bubble, heart, bookmark, share, bell and the logo slapped on; EVERYTHING HERE / BREATHES fitted full width; lede plus Join Aura (sun sticker) and Sign in.
      FORM: user-pinned H2 "The slap" (spec §2); no seed roll.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
    -->
```

- [ ] **Step 2: Build and check the contract survives**

```bash
npm run build
grep -c "THESIS: Aura" dist/index.html
```

Expected: `1`.

- [ ] **Step 3: Browser pass (guest)**

At `/`, at 375, 768, 1280 and 1440, in Paper and Night:
- `scrollWidth` equals the viewport width.
- The poster lines fit, and the objects and logo sit on the wall.
- "How it feels" pins, and its steps advance as you scroll (check `aria-current`).
- Typing in "Your sticker" updates the preview. **Claim it** opens `/auth/register` with the username filled in.
- There are no console errors.
- Under emulated reduced motion, the pinned section is static and in its finished state.

- [ ] **Step 4: Commit** — `git commit -m "Record the landing's direction contract"`
