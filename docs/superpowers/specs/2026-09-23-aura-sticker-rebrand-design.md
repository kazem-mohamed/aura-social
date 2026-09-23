# Aura — Sticker Rebrand & Rebuild · Design Spec

**Date:** 2026-09-23 · **Branch:** `rebrand/sticker` · **Status:** approved decisions, awaiting spec review

**Brand sheet (source of truth for visuals):** https://claude.ai/artifact/9gyAtx6gaCA2YdgojjqUKD — source file `../brand-lab/aura-brand-sheet.html` (outside this repo).
**Style reference:** Slush style extract (`DESIGN (2).md`), used for its grammar only. Nothing is copied from it: not its ribbon, its fonts, or its name.

---

## 1. Goal

Replace the entire visual identity and interface of Aura — every page, component, state and motion — with a new brand, "the sticker wall". Keep every existing capability, API call, auth flow, cache behaviour and route working. The old "Accession Card" design is cancelled, not refined: it is not a visual reference for anything in this spec.

**Success looks like:** a signed-out visitor lands on a poster-grade landing page. A signed-in person moves through a dock-driven app where every action has physical feedback. Every screen has designed loading, empty, error and success states. Both themes (Paper, Night) are fully designed. It runs smoothly on a mid-range phone.

### Non-goals

- No new backend capabilities (no DMs, stories, video or OAuth). The API is Route Academy's practice API at `route-posts.routemisr.com`.
- No fabricated proof: no user counts, testimonials or metrics. Sample content is labelled as sample.
- No UI locale change: the interface stays English and LTR.
- No automated test framework (decision: typecheck + lint + browser verification).

---

## 2. Locked decisions

| Area | Decision |
|---|---|
| Name | **Aura** — from the Greek αὔρα, "breath". Concept: *people are the air; interaction inflates things; empty things deflate.* Tagline: **Everything here breathes.** |
| Logo | **A · Die-Cut sticker.** Outlined Anybody wordmark on an Electric Blue die-cut sticker, placed at −4°, peeling top-right. |
| Type | **Anybody 900** (display, variable `wdth` 50–150) + **Onest 500/700** (UI). Both SIL OFL, self-hosted. |
| Signature | Our own **inflated 3D action objects** (bubble, heart, bookmark, share loop, bell) + deflated/popped variants. Not the reference's ribbon. |
| Themes | **Paper** (light, default) + a fully designed **Night paper**. The theme follows the system until the person chooses. |
| Surfaces | Public **landing** at `/` for guests + the full app for signed-in people. |
| Shell | **S2 — floating dock on every breakpoint** + a **poster header** opening every page. No top bar in the app. |
| Feed | **Single reading column**, newest first. |
| Landing hero | **H2 "The slap"**: empty Sky Wash wall, `EVERYTHING HERE BREATHES`, 3D objects and the logo slap on, and scrolling inflates them. |
| Landing story | Hero → How it feels → Your sticker → The wall → Join. |
| Identity | Deterministic **identity sticker** per handle (colour + shape + tilt), replacing the old aura ring. |
| Build | **Incremental**, phase by phase on `rebrand/sticker`. The app runs and stays functional after every phase. |
| Verification | `tsc -b` + `eslint` + browser checks at 4 breakpoints × 2 themes, plus reduced motion. |

---

## 3. What is kept, what is replaced

**Kept (logic):** `src/features/*/api`, `src/features/*/hooks`, `src/features/*/model`, `src/shared/api/*`, `src/shared/config/*`, `src/shared/lib/{dates,records,values}.ts`, `src/shared/hooks/*`, the auth context/provider, route guards, query keys, the cache helpers and all optimistic-update logic.

**Replaced (UI):** `src/shared/ui/*`, every `features/*/components/*`, `src/layouts/*`, `src/pages/*`, `src/index.css`, `index.html` (the design-contract comment and fonts), `src/hero.ts`.

**Removed:** `@heroui/react` (provider only; no visible component uses it), `src/hero.ts`, `@internationalized/date` if no longer referenced, and the old aura ring (`src/shared/lib/aura.ts`, which the identity sticker replaces).

**Adapted, not rewritten:** `src/shared/lib/theme.ts`. Keep the storage key `aura-theme`, the pre-paint script and the view-transition switch; restyle the reveal.

**Docs:** archive `PRODUCT.md`, `DESIGN.md` and `docs/brand-*` / `docs/design-tokens.*` (both the repo copies and the root copies) into `docs/archive/2026-accession-card/`. Write new `PRODUCT.md` and `DESIGN.md` that describe this spec as built.

**Data rule:** the only behaviour change to logic is additive. `RegisterPage` accepts an optional `handle` in router state to pre-fill `username` (from the landing's "Claim it").

---

## 4. Design tokens

All tokens live as CSS custom properties in `src/styles/tokens.css`, exposed to Tailwind v4 through `@theme`. Components consume the **semantic** layer only.

### 4.1 Colour — primitives

| Token | Hex | Role |
|---|---|---|
| `--carbon` | `#000000` | Ink, outlines, primary action |
| `--paper` | `#FFFFFF` | Canvas, cards |
| `--sky` | `#DCEEFF` | Hero and primary bands |
| `--concrete` | `#CCCCCC` | Interlude bands |
| `--mist` | `#E9E9E9` | Disabled, skeletons |
| `--blue` | `#4DA2FF` | Logo sticker, comment, 3D hero. **Never an action fill.** |
| `--ember` | `#FB4903` | Like, error sticker |
| `--sun` | `#FFD731` | Save, warning sticker |
| `--violet` | `#5C4ADE` | Share (white text allowed, 6:1) |
| `--mint` | `#55DB9C` | Follow, success sticker |
| `--lavender` | `#E9CCFF` | Washes, tags, identity |
| `--night` | `#111114` | Night ground |
| `--night-sky` | `#0D1826` | Night hero band |
| `--graphite` | `#232327` | Night interlude band |
| `--ash` | `#1B1B1F` | Night subtle fill |
| `--bone` | `#F6F5F0` | Night ink, outlines, die-cut edge |

### 4.2 Colour — semantic (Paper → Night)

| Token | Paper | Night |
|---|---|---|
| `--ground` | paper | night |
| `--band-sky` / `--band-concrete` / `--band-lav` | sky / concrete / lavender | night-sky / graphite / `#1D1729` |
| `--surface` / `--surface-2` | `#FFFFFF` / `#F2F2F2` | `#18181C` / `#222227` |
| `--ink` / `--ink-2` / `--ink-3` | `#000` / `#3A3A3A` / `#6B6B6B` | bone / `#B8B7B0` / `#8A8984` |
| `--line` | carbon | bone |
| `--action-bg` / `--action-ink` | carbon / paper | bone / night |
| `--cut` (die-cut edge) | transparent | bone |
| `--focus` | carbon | bone |

Rules: text is always ink. The six stickers are fills, never text colours. On every sticker fill the text is carbon, except white on violet. Stickers keep their colours and their black outline in both themes.

### 4.3 Typography

Fonts: `@fontsource-variable/anybody` and `@fontsource-variable/onest` (self-hosted woff2, `font-display: swap`). Preload the Latin subset of both. Numerals use `font-variant-numeric: tabular-nums` wherever they count.

| Token | Face | Size | Leading | Tracking |
|---|---|---|---|---|
| `display-xl` | Anybody 900 · wdth 124 | `clamp(96px, 21vw, 360px)` | 0.76 | −0.015em |
| `display` | Anybody 900 · wdth 112 | `clamp(52px, 9vw, 150px)` | 0.80 | −0.01em |
| `poster` (page headers) | Anybody 900 · wdth 112 | `clamp(56px, 11vw, 176px)` | 0.78 | −0.01em |
| `heading` | Onest 700 | `clamp(30px, 3.4vw, 52px)` | 1.02 | −0.03em |
| `heading-sm` | Onest 700 | 22–28px | 1.10 | −0.02em |
| `body-lg` | Onest 500 | 17px | 1.40 | −0.01em |
| `body` | Onest 500 | 15px | 1.45 | −0.01em |
| `caption` | Onest 500 | 12–13px | 1.50 | 0 |
| `label` | Onest 700, caps | 11–13px | 1.0 | +0.032em |

### 4.4 Space, shape, outline, layers

- **Spacing:** 4px base, scale `4 8 12 16 20 24 28 32 40 48 56 64 80 96 128 180`.
- **Radius:** `pill` 999px (buttons, nav, tags, inputs) · `card` 24px · `card-lg` 40px (modals, sheets, composer) · `chip` 16px · stickers organic.
- **Outline:** `hair` 1px (UI) · `control` 1.5px (focused/pressed controls) · `sticker` 3px (display stickers only).
- **Shadows:** none, and **gradients:** none, anywhere. Elevation = outline + colour band + motion.
- **Tilt:** stickers and decoration −8°…+8°. UI controls never tilt at rest; they may tilt ≤2° on hover.
- **z-index:** `base 0 · raised 10 · sticky 20 · dock 40 · overlay 60 · modal 70 · toast 80 · peel 90`.
- **Breakpoints:** `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1440`. Designed targets: phone (<640), tablet (640–1023), laptop (1024–1439), desktop (≥1440). Content max-width 1440; reading column 640.

### 4.5 Motion tokens

| Token | Value | Use |
|---|---|---|
| `--ease-spring` | `cubic-bezier(.34,1.56,.64,1)` | Release, like, save, arrive, slap-in |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | Peel, route, sheets |
| `--dur-press` | 90ms | Press in |
| `--dur-quick` | 220ms | Hover, exit, fades |
| `--dur-base` | 380ms | Release, toggles |
| `--dur-arrive` | 480ms | Cards, toasts, modals |
| `--dur-peel` | 560ms | Logo lift, follow, page peel |
| `--dur-route` | 360ms | View Transitions |
| `--dur-breath` | 4800ms | Ambient loops (landing only) |

JS springs (Motion) mirror these: `press {stiffness 700, damping 30}`, `release {stiffness 420, damping 18}`, `arrive {stiffness 260, damping 22}`.

---

## 5. Brand assets in code

### 5.1 Logo — `src/shared/brand/Logo.tsx`

- The outlined path data for `aura` (Anybody 900 wdth 100) and `a` (wdth 112) is generated once and stored in `src/shared/brand/logoPaths.ts`. The logo never depends on a font loading.
- Geometry and peel: exactly as the brand sheet (`fold()` → clip path + mirrored flap with 9% curl; `x` = x-height = peel = clear space).
- Variants: `primary` (−4°), `round`, `symbol`, `mono`, `horizontal`. Props: `variant`, `peel` (at rest), `interactive` (hover lift), `slapIn` (first-load animation), `cut` (auto from theme), `title`.
- `PeelLoader` = the symbol with the peel oscillating. It's used for brand-level loading only: route suspense, auth submit, landing boot.
- Favicons and app icons are generated from the symbol: `favicon.svg`, `favicon-32.png`, `apple-touch-icon-180.png`, `icon-512.png`, and an OG image 1200×630.

### 5.2 Identity sticker — `src/shared/brand/identity.ts` + `IdentitySticker.tsx`

- FNV-1a 32-bit hash of the lower-cased, trimmed handle. `colour = h % 6`, `shape = (h>>>3) % 7` of `circle, squircle, flower, burst, clover, scallop, blob`, `tilt = ((h>>>9) % 17) − 8`, `seed = ((h>>>13) % 628)/100`.
- Renders as the frame behind the avatar photo. With no photo (or when the photo fails), the initials sit on paper inside the frame. This replaces `DEFAULT_PROFILE_IMAGE` everywhere.
- It also supplies the person's colour to their focus ring in the handle field and to their profile poster accent.

### 5.3 Flat sticker icons — `src/shared/brand/stickers/*`

Code-drawn SVG: bubble, heart, bookmark, share loop, bell, sparkle, check, cross, bang, info. Fill comes from a prop, the black outline is fixed, and the die-cut layer follows `--cut`. UI glyphs (menu, close, search, arrows, camera, trash, edit) are a separate 1.75px-stroke line set drawn in the same geometry. No icon library.

### 5.4 Inflated 3D objects — `src/assets/objects/*`

| Slot | Source render | Use |
|---|---|---|
| `bubble` | `02_49_38` (alpha) | Landing hero anchor, "How it feels" comment beat, OG image |
| `heart` | `02_50_08` (alpha) | Like beat, like-burst hero moment |
| `bookmark` | `02_50_51` (alpha) | Save beat |
| `share` | `02_51_41` (alpha) | Share beat |
| `bell` | `02_52_23` (cut) | Notifications, landing wall |
| `bubble-deflated` | `02_54_52` (cut) | Empty feed, empty comments |
| `bell-deflated` | `02_55_22` (cut) | Empty notifications |
| `bookmark-deflated` | `02_55_55` (cut) | Empty saved |
| `bubble-popped` | `02_58_35` (alpha) | 404, fatal error boundary |

- **Processing:** background removed with a local matting model (valves preserved), trimmed to content plus a 4% margin. Exported at 480w and 960w as **AVIF + WebP**, with a PNG fallback at 480w only. Target ≤ 60 KB per AVIF@960. Delivered through one `<ObjectArt name size priority>` component (`<picture>`, explicit width/height, `loading="lazy"` except the hero's LCP object which is `fetchpriority="high"`).
- **Fallback:** if an image fails, `<ObjectArt>` renders the flat sticker of the same name, so no layout shift and no broken image.
- **Originals:** kept outside the repo in `brand-lab/renders/`.

---

## 6. Motion system

Library: **Motion** (`framer-motion` 12, already installed) for springs, gestures, `AnimatePresence`, layout and `useScroll`. **View Transitions API** through React Router's `viewTransition` for route and shared-element changes. **Lenis** on the landing page only (mounted there, destroyed on unmount, off under reduced motion). No GSAP.

| Behaviour | Where | Spec |
|---|---|---|
| Press | every pressable | scale .94 in 90ms; spring release |
| Hover lift | buttons, cards, links | translateY −2px, rotate ≤ −1.5°, spring |
| Like | post and comment like | heart inflate 1 → 1.38 → .9 → 1 (520ms), 8-dot palette burst, rolling count. Unlike: squash then settle |
| Save | bookmark | drop from −22px, rotate −10°, squash 1.14×.82, stick |
| Follow | follow button | diagonal peel of the ink layer revealing mint "Following" (500ms) |
| Share | share sheet open | the share loop spins 360° once, and the sheet arrives |
| Arrive | cards entering view and new posts | from −18px, tilt ±6–9°, scale 1.08 → rest with spring, 70ms stagger. Never a fade-up |
| Route | all in-app navigation | View Transition: outgoing page peels from the top-right corner (clip-path), incoming settles. Post image → post detail as a shared element (`view-transition-name: post-{id}`) |
| Dock ↔ nav | sign in / sign out | the landing top nav peels off and re-sticks as the dock (one View Transition) |
| Slap-in | logo on first load, landing hero objects | from scale 1.3, −10° → squash → settle, then the corner lifts |
| Breathe | landing objects, PeelLoader | scale 1 ↔ 1.06 over 4.8s; landing only |
| Skeleton | every loading list | opacity .45 ↔ 1 + scale .985, 1.8s; no shimmer |
| Toast | global feedback | slaps on from +26px at −7°, holds 2.4s, lifts away in 220ms |
| Scroll-linked | landing only | objects inflate with scroll progress; pinned "How it feels" post plays like → comment → save → share |

**Reduced motion:** every behaviour collapses to an instant state change. There are no loops, no parallax, no Lenis, and route transitions become instant (no View Transition). This is implemented once in a `useMotionPrefs()` hook plus CSS `@media (prefers-reduced-motion)`.
**Performance rules:** animate transform and opacity only, never layout. Observers are cleaned up on unmount. Scroll handlers are passive or use `useScroll`. Loops pause off-screen through IntersectionObserver.

---

## 7. Component system — `src/shared/ui/*`

Every component is keyboard accessible, has a visible focus state, works in both themes, and animates with the motion primitives. Each one declares its variants and states:

| Component | Variants | States |
|---|---|---|
| `Button` | primary (ink), secondary (outline), ghost, sticker (sun/mint/lavender/violet fill — landing CTAs only, never blue), destructive (ember), icon, link | default, hover, active/press, focus-visible, disabled, loading (PeelLoader-mini replaces the label, width locked), success tick |
| `Field` (text / email / password / search) | default, with icon, with counter, with action (show password) | default, hover, focus (ring in identity colour when known, else ink), filled, disabled, error (ember ring + message + shake on submit), success (mint tick), loading (async check) |
| `TextArea` | autosize | same states + live count with warning sticker at 90% |
| `Select`, `DateField`, `RadioPills` (gender), `Toggle`, `Segmented` (feed rooms, profile tabs) | — | full keyboard; the segmented indicator is a sticker that slides with a spring |
| `Card` | default, interactive, featured (band colour), compact, media, profile, content | hover lift, press, focus-within |
| `PostCard` | text, image, shared (nested quoted card), with top comment | loading skeleton, optimistic (pending outline), deleted (tombstone) |
| `Avatar` | sm/md/lg/xl, with identity frame | image loading (paper + initials until decoded), error → initials |
| `Modal` / `Sheet` | centred modal (desktop), bottom sheet (phone) | focus trap, Esc, backdrop click, arrive/leave motion, scroll lock |
| `Menu` / `Dropdown` | post menu, comment menu, profile menu | roving focus, typeahead, outside click |
| `Tabs` | underline-free sticker tabs | — |
| `Toast` | success, info, warning, error (sticker states) | auto-dismiss, pause on hover, action slot ("Undo") |
| `Skeleton` | line, circle, card, post | breathing pulse |
| `EmptyState` | feed, comments, notifications, saved, search, profile-no-posts | deflated 3D object + one line + one CTA |
| `ErrorState` | inline, section, page | human sentence + retry action + popped object (page-level) |
| `Counter` | rolling digits | tabular numerals |
| `ActionButton` | like, comment, save, share, follow | the behaviours from §6 + optimistic states |
| `Tooltip` | dock labels on tablet | delay 400ms, keyboard reachable |
| `PeelLoader` | brand loader | — |
| `Marquee` | landing ticker | pause on hover and reduced motion |

Structure: one component per file, and feature components (`features/*/components`) compose `shared/ui`. No component file over ~250 lines; split by concern.

---

## 8. Shell

- **Dock** (`src/layouts/Dock.tsx`): a floating ink pill, bottom-centre, `z-dock`, safe-area aware. Items: **Wall · People · Post (+) · Alerts · You**.
  - Desktop (≥1024) shows icon + label.
  - Tablet shows icons, with a tooltip on hover and focus.
  - Phone shows icons with 10px labels and 48px targets.
  - Post opens the composer sheet from anywhere. Alerts carries the unread count as an ember sticker badge that inflates when the count rises. You opens the profile, and Settings and Sign out live in the You page's menu.
- **Logo:** the primary sticker sits top-left on every page, scrolls away with the page, and lifts on hover. It is not sticky: the dock owns persistence.
- **Poster header** (`PosterHeader.tsx`): page title in `poster` type, an optional line of context, and optional controls on the right (e.g. feed rooms). On the profile it becomes the person's name at `display-xl`. Names are capped at 15 characters by the API schema.
- **Theme switch:** in the You menu and on Settings. It keeps the existing circle-reveal View Transition, restyled as a peel.
- **Page structure:** the poster header, then content in a 640px reading column (feed, post, notifications, settings) or a wider grid (profile media grid, people), then bottom padding that clears the dock.

---

## 9. Pages

Each page ships with designed **loading / empty / error / success** states. Copy follows the brand voice: short, verbs first, warm, never snarky.

| Page | Why it exists · primary action | Structure | States |
|---|---|---|---|
| **Landing** `/` (guests) | Make Aura felt, then get a sign-up | 1. Marquee + top pill nav (logo, How it feels, Your sticker, Sign in, **Join Aura**). 2. **Hero — The slap**: Sky Wash wall, `EVERYTHING HERE BREATHES` in `display-xl`, the 3D objects + logo slap on in sequence, and scroll inflates them. 3. **How it feels**: a pinned sample post; scroll plays like → comment → save → share with the matching 3D object. 4. **Your sticker**: handle field → live identity sticker → **Claim it** navigates to register with `state.handle`. 5. **The wall**: the real features as stickers arriving on scroll. 6. **Join**: final CTA band + honest footer ("A portfolio project built on the Route Academy practice API") | Sample content visibly labelled "Sample". No live posts (the API requires auth) |
| **Sign in** | Get back in | Poster "WELCOME BACK" + sticker form card; link to register | Field errors, API error toast, submit loading (PeelLoader-mini), success → slap to Wall |
| **Register** | Join | Poster "JOIN THE WALL" + identity sticker preview that updates as the username is typed; form: name, username, email, password (live rule checklist), repeat, date of birth, gender | Pre-fill from landing. Same states as sign in. On success → success sticker, then redirect to Sign in after a short beat (as today) |
| **Wall** (feed) | Read and react | Poster "WALL" + segmented rooms (Everyone · Following · Yours · Saved) → composer card → post column | Skeleton posts. Empty per room (deflated bubble or bookmark + CTA "Find people" or "Write a post"). Error section with retry. Posted toast; the new post arrives with a spring |
| **Post** `/post/:id` | Read one post and its conversation | Shared-element image, full post, action bar, comments with nested replies, reply composer | Skeleton, not-found (popped), empty comments (deflated bubble), optimistic comment/reply, edit and delete confirmations |
| **Profile** `/profile[/:id]` | See a person | Name as `display-xl` poster, cover band (or their identity colour band when there is no cover), avatar in the identity frame, counts, Follow / Edit, tabs Posts · Saved (shown on every profile, as today) | Photo/cover upload with crop editor, image viewer, cover privacy modal, follow optimistic, empty posts |
| **People** | Find someone | Poster "PEOPLE" + search field + results/suggestions as profile cards with follow | Debounced search loading, no results (deflated bubble + suggestion), error retry |
| **Alerts** | Catch up | Poster "ALERTS" + filter (All · Unread) + list; mark one, mark selected, mark all | Skeleton, empty (deflated bell), error, marked-read animation |
| **Settings** | Change password, theme, sign out | Poster "SETTINGS" + password form + theme toggle + sign out | Field and API errors, success toast |
| **404** | Recover | Popped bubble + `THIS ONE POPPED` + back to Wall/Landing | — |
| **Error boundary** | Survive a render crash | Same as 404 with "Something popped" + reload | — |

---

## 10. Routing changes

- `/` renders a `HomeGate`: **Landing** for guests, **Wall** for authenticated people. The other guarded routes stay under `RequireAuth`, and `RequireGuest` stays on `/auth/*`.
- `RegisterPage` reads `location.state?.handle` and pre-fills `username`.
- Legacy redirects (`/Setting`, `/setting`, `/PostDetails/:id`) are unchanged. Route paths are unchanged.
- The landing and every page stay code-split. Landing-only libraries (Lenis) load only in the landing chunk.

---

## 11. Accessibility & performance

- Semantic landmarks: `header` (landing), `main`, `nav[aria-label="Primary"]` for the dock. Headings are hierarchical. The poster header is the page's `h1`.
- Focus: visible 2px ring on every interactive element, with a skip link to content. Modals and sheets trap focus and restore it on close.
- Touch targets ≥ 44px (48px in the dock). Contrast: ink on every ground and sticker ≥ 4.5:1; violet uses white text.
- Live regions: toasts are `role="status"`, errors `role="alert"`, and counters announce via `aria-label`.
- Reduced motion: see §6.
- Budgets:
  - The landing LCP object is the hero bubble AVIF with priority, and fonts are preloaded.
  - Initial JS for the app route ≤ current baseline + 15%. Phase 0 records the baseline from `vite build` output before any change.
  - No layout shift from images (explicit sizes).

---

## 12. Implementation phases (each ends with a running app, typecheck + lint clean, browser-verified)

0. **Foundation:** tokens + fonts + global CSS reset. Remove HeroUI. Brand primitives (Logo, IdentitySticker, stickers, ObjectArt + processed assets, PeelLoader). Motion primitives. Theme adapter. Archive old docs.
1. **Core components:** everything in §7, with a hidden `/__kit` route for review (dev only).
2. **Shell:** Dock, PosterHeader, page frame, route transitions, HomeGate.
3. **Pages:** Auth → Wall (+ composer, PostCard) → Post → Profile → People → Alerts → Settings → 404 / error boundary.
4. **Landing:** all five sections + register pre-fill.
5. **Polish:** motion pass → responsive pass (4 breakpoints × 2 themes) → quality pass (a11y, perf, reduced motion, copy) → new `PRODUCT.md` / `DESIGN.md`.

## 13. Verification per phase

`npm run typecheck` and `npm run lint` pass. Every changed page is checked in the browser preview at 375 / 768 / 1280 / 1440 in Paper and Night, keyboard-only once, and with reduced motion once. Real API flows touched in the phase are exercised end-to-end: sign in, post, like, comment, reply, save, share, follow, upload, notifications, change password.

## 14. Risks

- **The practice API is shared and rate-limited:** keep existing retry/cache settings, and do not add polling.
- **Font-axis animation cost:** animate `wdth` only on the landing and on hover of single headlines, never on lists.
- **View Transitions support:** feature-detect, and fall back to instant navigation.
- **Bottom dock on desktop is unconventional:** labels are always visible at ≥1024 and the dock is the first landmark after the skip link.
