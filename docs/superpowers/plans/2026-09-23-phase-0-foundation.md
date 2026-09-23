# Aura Rebrand — Phase 0: Foundation · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the new design system's foundation. That covers tokens, fonts, base CSS, the motion primitives, and the brand primitives: the logo with its live peel, the identity sticker, the flat stickers, the line glyphs and the 3D object art. It also includes the processed image assets, the favicons, the OG image and a dev-only `/__kit` review page. HeroUI is removed, and every existing page keeps working throughout.

**Architecture:**
- The new tokens own the shared semantic names (`--ground`, `--ink`…).
- The old Accession Card CSS moves to `src/styles/legacy.css` minus those names, so the old pages keep rendering until Phase 3 replaces them.
- Brand primitives live in `src/shared/brand/` and motion primitives in `src/shared/motion/`.
- Generated artefacts (the logo outlines, object images and icons) come from small Node scripts in `../brand-lab/tools/`, outside this repo.

**Tech Stack:**
- React 19, TypeScript 6, Vite 7, Tailwind v4 (`@theme`, `@utility`) and framer-motion 12.
- Self-hosted fonts: `@fontsource-variable/anybody` + `@fontsource-variable/onest`.
- Asset tooling: sharp + fontkit.

**Spec:** `docs/superpowers/specs/2026-09-23-aura-sticker-rebrand-design.md`

## Global Constraints

- No shadows and no gradients anywhere in new UI. Elevation = 1px outline + colour band + motion.
- Text is always `--ink`. The six sticker colours are fills only. On a sticker fill, text is carbon, except white on violet.
- Electric Blue (`--blue`) is never an action fill.
- Animate transform/opacity only. Every animation collapses under `prefers-reduced-motion` (`<MotionConfig reducedMotion="user">` + `useMotionPrefs()` + the CSS media query).
- Both themes: `data-theme="light"` (Paper) and `data-theme="dark"` (Night) on `<html>`, set before paint by `index.html`. The storage key stays `aura-theme`.
- `.tsx` files export components only (lint rule `react-refresh/only-export-components`). Data, helpers and contexts go in `.ts` files.
- No test framework. Verification = `npm run typecheck`, `npx eslint <changed paths>`, and a browser check of `/__kit` and one existing page at 375 / 768 / 1280 / 1440 in both themes.
- Baseline before Phase 0 (`vite build`): `index` JS 225.46 kB (71.87 kB gz), CSS 260.62 kB (33.43 kB gz), `react` 90.16 kB, `query` 37.15 kB, `http` 36.62 kB, `forms` 87.40 kB. Pre-existing lint errors: 3 (`FetchRule.tsx`, `ThemeToggle.tsx`, `ToastProvider.tsx` in old `shared/ui`, deleted in Phase 3).
- Files in this plan are materialised with `node ../brand-lab/tools/extract-plan.cjs <plan> <task>`. It writes every `**File:**` block of that task, relative to the app root.

---

### Task 0.1: Tooling workspace

**Files:**
- Create: `../brand-lab/package.json`
- Create: `../brand-lab/tools/extract-plan.cjs`
- Create: `../brand-lab/fonts/Anybody.ttf` (copied from the Google Fonts repo)

**Interfaces:**
- Produces: `node ../brand-lab/tools/extract-plan.cjs <planPath> <taskId>`; sharp + fontkit available to `../brand-lab/tools/*.cjs`.

- [ ] **Step 1: Create the workspace manifest**

**File:** `../brand-lab/package.json`

```json
{
  "name": "aura-brand-lab",
  "private": true,
  "description": "Brand tooling for Aura: logo outlines, object art, icons. Lives outside the app repo.",
  "scripts": {
    "outline": "node tools/outline.cjs",
    "objects": "node tools/objects.cjs",
    "icons": "node tools/icons.cjs"
  },
  "devDependencies": {
    "fontkit": "^2.0.4",
    "sharp": "^0.34.4"
  }
}
```

- [ ] **Step 2: Create the plan extractor**

**File:** `../brand-lab/tools/extract-plan.cjs`

```js
// Materialises the "**File:** `path`" code blocks of one task in a plan.
// Usage: node extract-plan.cjs <plan.md> <taskId>   e.g. 0.3
// Paths in the plan are relative to the app root (the plan lives in app/docs/superpowers/plans).
const fs = require("fs");
const path = require("path");

const [planPath, taskId] = process.argv.slice(2);
if (!planPath || !taskId) {
  console.error("Usage: node extract-plan.cjs <plan.md> <taskId>");
  process.exit(1);
}

const appRoot = path.resolve(path.dirname(planPath), "../../..");
const md = fs.readFileSync(planPath, "utf8");
const start = md.indexOf(`### Task ${taskId}:`);
if (start === -1) {
  console.error(`Task ${taskId} not found`);
  process.exit(1);
}
const next = md.indexOf("\n### Task ", start + 1);
const section = md.slice(start, next === -1 ? undefined : next);

const block = /\*\*File:\*\* `([^`]+)`\s*\n+```[a-z]*\n([\s\S]*?)\n```/g;
let match;
let count = 0;
while ((match = block.exec(section))) {
  const target = path.resolve(appRoot, match[1]);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${match[2]}\n`);
  console.log("wrote", path.relative(appRoot, target));
  count++;
}
console.log(`${count} file(s) from task ${taskId}`);
```

- [ ] **Step 3: Install tooling and copy the font**

```bash
cd ../brand-lab && npm install --silent && mkdir -p fonts && cp "$SCRATCH/fontwork/Anybody.ttf" fonts/Anybody.ttf
```
(`$SCRATCH` = the session scratchpad. If absent, download `https://github.com/google/fonts/raw/main/ofl/anybody/Anybody%5Bwdth%2Cwght%5D.ttf` to `fonts/Anybody.ttf`.)
Expected: `ls ../brand-lab/node_modules/sharp ../brand-lab/node_modules/fontkit` succeeds.

- [ ] **Step 4: Add `brand-lab/node_modules` to nothing** — brand-lab is not a git repo, and nothing is committed from it.

---

### Task 0.2: Outlined logo paths

**Files:**
- Create: `../brand-lab/tools/outline.cjs`
- Generate: `src/shared/brand/logoPaths.ts`, `../brand-lab/out/headline.json`

**Interfaces:**
- Produces: `WORD_PATH: string` ("aura", Anybody 900 wdth 100, size 100, baseline y=0, left x≈2.5) and `GLYPH_A_PATH: string` ("a", wdth 112, size 100) from `@/shared/brand/logoPaths`.

- [ ] **Step 1: Write the outliner**

**File:** `../brand-lab/tools/outline.cjs`

```js
// Outlines Anybody glyph runs to SVG path data (y-down, baseline at y = 0).
// Writes the app's logo paths and the OG headline paths.
const fontkit = require("fontkit");
const fs = require("fs");
const path = require("path");

const base = fontkit.openSync(path.join(__dirname, "../fonts/Anybody.ttf"));
const round = (v) => Math.round(v * 100) / 100;

function run(text, axes, size, tracking = 0) {
  const font = base.getVariation(axes);
  const s = size / font.unitsPerEm;
  const layout = font.layout(text, ["kern"]);
  let x = 0;
  let d = "";
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  layout.glyphs.forEach((glyph, i) => {
    const pos = layout.positions[i];
    const p = glyph.path.scale(s, -s).translate(x + pos.xOffset * s, -pos.yOffset * s);
    d += p.toSVG();
    const bb = p.bbox;
    if (Number.isFinite(bb.minX)) {
      minX = Math.min(minX, bb.minX); maxX = Math.max(maxX, bb.maxX);
      minY = Math.min(minY, bb.minY); maxY = Math.max(maxY, bb.maxY);
    }
    x += pos.xAdvance * s + (i < layout.glyphs.length - 1 ? tracking : 0);
  });
  d = d.replace(/-?\d+\.\d+/g, (m) => String(round(parseFloat(m))));
  return { d, bbox: [round(minX), round(minY), round(maxX), round(maxY)] };
}

const word = run("aura", { wght: 900, wdth: 100 }, 100, -1.5);
const glyph = run("a", { wght: 900, wdth: 112 }, 100);

const target = path.resolve(__dirname, "../../app/src/shared/brand/logoPaths.ts");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(
  target,
  [
    "/* Generated by brand-lab/tools/outline.cjs from Anybody 900. Do not edit by hand. */",
    "",
    `/** "aura" at wdth 100, size 100, baseline y = 0. Bounds ${JSON.stringify(word.bbox)}. */`,
    `export const WORD_PATH =\n  "${word.d}";`,
    "",
    `/** "a" at wdth 112, size 100, baseline y = 0. Bounds ${JSON.stringify(glyph.bbox)}. */`,
    `export const GLYPH_A_PATH =\n  "${glyph.d}";`,
    "",
  ].join("\n"),
);

// Condensed (wdth 76) so the three-line headline fits the OG card's left column.
const lines = ["EVERYTHING", "HERE", "BREATHES"].map((t) => run(t, { wght: 900, wdth: 76 }, 100, -1));
fs.mkdirSync(path.join(__dirname, "../out"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "../out/headline.json"), JSON.stringify(lines));
console.log("wrote", target, "word bbox", word.bbox, "glyph bbox", glyph.bbox);
```

- [ ] **Step 2: Run it**

Run: `cd ../brand-lab && node tools/outline.cjs`
Expected: `word bbox [ 2.5, -59.9, 278.45, 0.7 ] glyph bbox [ 3, -59.75, 75.65, 0.7 ]`, and `src/shared/brand/logoPaths.ts` exists with two exported strings.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck` → exit 0.

---

### Task 0.3: Tokens, fonts, base CSS, legacy split, HeroUI removal

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/legacy.css`
- Modify (replace): `src/index.css`, `src/app/providers/AppProviders.tsx`, `index.html`, `vite.config.ts`
- Delete: `src/hero.ts`
- Modify: `package.json` (remove `@heroui/react`, `@internationalized/date`; add the two font packages, already installed)

**Interfaces:**
- Produces Tailwind utilities:
  - colours: `bg-ground`, `bg-surface`, `bg-surface-2`, `bg-band-{sky,concrete,lav,mist}`, `text-ink`, `text-ink-2`, `text-ink-3`, `border-line`, `bg-action`, `text-action-ink`, `bg-{carbon,paper,sky,concrete,mist,blue,ember,sun,violet,mint,lavender,night,bone}`
  - radii: `rounded-{pill,card,card-lg,chip}`
  - easings: `ease-spring`, `ease-out`
  - fonts: `font-sans` (Onest), `font-display` (Anybody)
  - type: `type-{display-xl,display,poster,heading,heading-sm,body-lg,body,caption,label}`, `tnum`
- Produces CSS variables: `--dur-*`, `--ease-*-css`, `--z-*`, `--reading`, `--page-max`, `--scrim`, `--cut`, `--focus`.

- [ ] **Step 1: Write the tokens**

**File:** `src/styles/tokens.css`

```css
/* Aura design tokens — spec §4.
   Primitives never change between themes; semantic tokens do.
   Components read semantic tokens (and sticker primitives as fills). */

:root {
  /* primitives */
  --carbon: #000000;
  --paper: #ffffff;
  --sky: #dceeff;
  --concrete: #cccccc;
  --mist: #e9e9e9;
  --blue: #4da2ff;
  --ember: #fb4903;
  --sun: #ffd731;
  --violet: #5c4ade;
  --mint: #55db9c;
  --lavender: #e9ccff;
  --night: #111114;
  --night-sky: #0d1826;
  --graphite: #232327;
  --ash: #1b1b1f;
  --bone: #f6f5f0;

  /* semantic · Paper */
  --ground: var(--paper);
  --band-sky: var(--sky);
  --band-concrete: var(--concrete);
  --band-lav: var(--lavender);
  --band-mist: var(--mist);
  --surface: #ffffff;
  --surface-2: #f2f2f2;
  --ink: #000000;
  --ink-2: #3a3a3a;
  --ink-3: #6b6b6b;
  --line: var(--carbon);
  --action-bg: var(--carbon);
  --action-ink: var(--paper);
  --cut: transparent;
  --focus: var(--carbon);
  --scrim: rgb(0 0 0 / 0.42);

  /* motion */
  --ease-spring-css: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out-css: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-press: 90ms;
  --dur-quick: 220ms;
  --dur-base: 380ms;
  --dur-arrive: 480ms;
  --dur-peel: 560ms;
  --dur-route: 360ms;
  --dur-breath: 4800ms;

  /* layers */
  --z-raised: 10;
  --z-sticky: 20;
  --z-dock: 40;
  --z-overlay: 60;
  --z-modal: 70;
  --z-toast: 80;
  --z-peel: 90;

  /* layout */
  --reading: 640px;
  --page-max: 1440px;
}

/* semantic · Night paper */
:root[data-theme="dark"] {
  --ground: var(--night);
  --band-sky: var(--night-sky);
  --band-concrete: var(--graphite);
  --band-lav: #1d1729;
  --band-mist: var(--ash);
  --surface: #18181c;
  --surface-2: #222227;
  --ink: var(--bone);
  --ink-2: #b8b7b0;
  --ink-3: #8a8984;
  --line: var(--bone);
  --action-bg: var(--bone);
  --action-ink: var(--night);
  --cut: var(--bone);
  --focus: var(--bone);
  --scrim: rgb(0 0 0 / 0.6);
}

@theme inline {
  --color-carbon: var(--carbon);
  --color-paper: var(--paper);
  --color-sky: var(--sky);
  --color-concrete: var(--concrete);
  --color-mist: var(--mist);
  --color-blue: var(--blue);
  --color-ember: var(--ember);
  --color-sun: var(--sun);
  --color-violet: var(--violet);
  --color-mint: var(--mint);
  --color-lavender: var(--lavender);
  --color-night: var(--night);
  --color-bone: var(--bone);

  --color-ground: var(--ground);
  --color-band-sky: var(--band-sky);
  --color-band-concrete: var(--band-concrete);
  --color-band-lav: var(--band-lav);
  --color-band-mist: var(--band-mist);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-line: var(--line);
  --color-action: var(--action-bg);
  --color-action-ink: var(--action-ink);

  --font-sans: "Onest Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-display: "Anybody Variable", "Arial Black", Impact, system-ui, sans-serif;

  --radius-pill: 999px;
  --radius-card: 24px;
  --radius-card-lg: 40px;
  --radius-chip: 16px;

  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);

  --breakpoint-2xl: 90rem;
}

/* type roles — spec §4.3 */
@utility type-display-xl {
  font-family: var(--font-display);
  font-weight: 900;
  font-stretch: 124%;
  font-size: clamp(96px, 21vw, 360px);
  line-height: 0.76;
  letter-spacing: -0.015em;
  text-transform: uppercase;
}
@utility type-display {
  font-family: var(--font-display);
  font-weight: 900;
  font-stretch: 112%;
  font-size: clamp(52px, 9vw, 150px);
  line-height: 0.8;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}
@utility type-poster {
  font-family: var(--font-display);
  font-weight: 900;
  font-stretch: 112%;
  font-size: clamp(56px, 11vw, 176px);
  line-height: 0.78;
  letter-spacing: -0.01em;
  text-transform: uppercase;
}
@utility type-heading {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: clamp(30px, 3.4vw, 52px);
  line-height: 1.02;
  letter-spacing: -0.03em;
}
@utility type-heading-sm {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: clamp(22px, 2vw, 28px);
  line-height: 1.1;
  letter-spacing: -0.02em;
}
@utility type-body-lg {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 17px;
  line-height: 1.4;
  letter-spacing: -0.01em;
}
@utility type-body {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 15px;
  line-height: 1.45;
  letter-spacing: -0.01em;
}
@utility type-caption {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 13px;
  line-height: 1.5;
  letter-spacing: 0;
}
@utility type-label {
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.032em;
  text-transform: uppercase;
}
@utility tnum {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: Write the base layer**

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

/* Route transitions — the default cross-fade; the peel arrives in Phase 2. */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--dur-route);
  animation-timing-function: var(--ease-out-css);
}

/* Theme switch — kept from the old system until Phase 2 restyles it as a peel. */
:root.theme-switching::view-transition-old(root) {
  animation: none;
}
:root.theme-switching::view-transition-new(root) {
  animation: theme-reveal 520ms var(--ease-out-css);
  clip-path: circle(140% at var(--theme-origin-x, 50%) var(--theme-origin-y, 50%));
}
@keyframes theme-reveal {
  from {
    clip-path: circle(0% at var(--theme-origin-x, 50%) var(--theme-origin-y, 50%));
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
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none !important;
  }
}
```

- [ ] **Step 3: Move the old system into a legacy layer**

**File:** `src/styles/legacy.css`

```css
/* LEGACY — the Accession Card styles still used by pages Phase 3 has not
   rebuilt yet. The names the new system owns (--ground, --ink, --ink-2,
   --ink-3) were removed from here on purpose so old pages pick up the new
   ground and ink. Delete this file at the end of Phase 3. */

:root,
:root[data-theme="light"] {
  --plate: #ffffff;
  --recess: #efebe4;
  --rail: #e4dfd6;
  --rail-strong: #d3ccc0;
  --verm: #e4572e;
  --verm-ink: #b93d19;
  --on-verm: #0b0a0a;
  --gold-ink: #8a6304;
  --plate-shadow: 0 1px 2px rgba(26, 22, 19, 0.05), 0 8px 24px rgba(26, 22, 19, 0.06);
  --plate-shadow-lifted: 0 2px 6px rgba(26, 22, 19, 0.07), 0 20px 48px rgba(26, 22, 19, 0.11);
}

:root[data-theme="dark"] {
  --plate: #141211;
  --recess: #1c1917;
  --rail: #292827;
  --rail-strong: #3b3733;
  --verm: #e4572e;
  --verm-ink: #f06b45;
  --on-verm: #0b0a0a;
  --gold-ink: #f5b301;
  --plate-shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.4);
  --plate-shadow-lifted: 0 2px 6px rgba(0, 0, 0, 0.55), 0 20px 48px rgba(0, 0, 0, 0.5);
}

@theme inline {
  --color-plate: var(--plate);
  --color-recess: var(--recess);
  --color-rail: var(--rail);
  --color-rail-strong: var(--rail-strong);
  --color-verm: var(--verm);
  --color-verm-ink: var(--verm-ink);
  --color-on-verm: var(--on-verm);
  --color-gold-ink: var(--gold-ink);

  --font-mono: "Onest Variable", ui-monospace, monospace;
  --font-serif: "Onest Variable", ui-serif, serif;
  --font-wordmark: "Anybody Variable", sans-serif;

  --text-micro: 0.6875rem;
  --text-label: 0.75rem;
  --text-sm: 0.8125rem;
  --text-base: 0.9375rem;
  --text-read: 1.0625rem;
  --text-lg: 1.25rem;
  --text-xl: 1.625rem;
  --text-2xl: 2.25rem;
  --text-3xl: 3rem;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}
input[type="range"]::-webkit-slider-runnable-track {
  height: 2px;
  background: var(--rail-strong);
}
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  margin-top: -6px;
  border-radius: 50%;
  background: var(--verm);
  cursor: grab;
}
input[type="range"]::-moz-range-track {
  height: 2px;
  background: var(--rail-strong);
}
input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 50%;
  background: var(--verm);
  cursor: grab;
}

@keyframes accession-shimmer {
  100% {
    transform: translateX(100%);
  }
}
.skeleton {
  position: relative;
  overflow: hidden;
  background: var(--recess);
}
.skeleton::after {
  content: "";
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--ink) 6%, transparent), transparent);
  animation: accession-shimmer 1.6s ease-in-out infinite;
}

@keyframes toast-arrive {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes toast-retract {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
.toast-note {
  animation: toast-arrive 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.toast-timer {
  animation: toast-retract linear both;
}

@keyframes fetch-sweep {
  0% {
    transform: translateX(-100%) scaleX(0.4);
  }
  50% {
    transform: translateX(0%) scaleX(0.7);
  }
  100% {
    transform: translateX(100%) scaleX(0.4);
  }
}
.fetch-rule {
  animation: fetch-sweep 1.15s cubic-bezier(0.65, 0, 0.35, 1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .skeleton::after {
    display: none;
  }
  .toast-note {
    animation: none;
  }
  .toast-timer {
    animation: none;
    transform: scaleX(0);
  }
  .fetch-rule {
    animation: none;
    opacity: 0.6;
  }
}
```

- [ ] **Step 4: Replace the stylesheet entry**

**File:** `src/index.css`

```css
@import "tailwindcss";
@import "@fontsource-variable/anybody/standard.css";
@import "@fontsource-variable/onest/index.css";
@import "./styles/tokens.css";
@import "./styles/base.css";
@import "./styles/legacy.css";
```

- [ ] **Step 5: Remove HeroUI from the provider stack and add the global motion config**

**File:** `src/app/providers/AppProviders.tsx`

```tsx
import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";
import { FetchRule } from "@/shared/ui/FetchRule";
import { ToastProvider } from "@/shared/ui/toast";
import { AuthProvider } from "@/features/auth/context/AuthProvider";

/**
 * Provider stack for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation honour
 * `prefers-reduced-motion` by default; components still opt out of loops
 * through `useMotionPrefs()`.
 *
 * `AuthProvider` sits inside `QueryClientProvider` because signing out
 * clears the query cache, and the error boundary wraps everything so a
 * render failure cannot blank the page.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <FetchRule />
              {children}
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 6: Replace the HTML shell**

**File:** `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>Aura — Everything here breathes</title>
    <meta
      name="description"
      content="Aura is a social network where every interaction has weight you can feel. Post, like, save and follow — everything here breathes."
    />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
    <meta name="theme-color" content="#111114" media="(prefers-color-scheme: dark)" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Aura — Everything here breathes" />
    <meta property="og:description" content="A social network where every interaction has weight you can feel." />
    <meta property="og:image" content="/og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <script>
      // Resolve the theme before first paint so neither theme flashes the other.
      (function () {
        try {
          var saved = localStorage.getItem("aura-theme");
          var theme =
            saved ||
            (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
          document.documentElement.setAttribute("data-theme", theme);
        } catch (e) {
          document.documentElement.setAttribute("data-theme", "light");
        }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Drop the HeroUI note from the chunk config**

**File:** `vite.config.ts`

```ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendors that every route needs are split so they cache independently
        // of app code and download in parallel. Route chunks come from the
        // React.lazy calls in the router.
        manualChunks: {
          react: ["react", "react-dom", "react-router"],
          query: ["@tanstack/react-query"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
          motion: ["framer-motion"],
          http: ["axios"],
        },
      },
    },
  },
});
```

- [ ] **Step 8: Remove HeroUI and delete its theme file**

```bash
git rm -q src/hero.ts && npm uninstall @heroui/react @internationalized/date --silent
```

- [ ] **Step 9: Verify**

Run: `npm run typecheck` → exit 0. Run: `npx vite build` → succeeds; note the new `index` JS and CSS sizes (expected much smaller than the baseline).
Browser: `npm run dev` preview at `/auth/login`. The old page renders with Onest text on a white (Paper) ground; toggle the OS theme to dark → Night ground `#111114`. No console errors.

- [ ] **Step 10: Commit**

```bash
git add -A src/styles src/index.css src/app/providers/AppProviders.tsx index.html vite.config.ts package.json package-lock.json
git commit -m "Add Aura tokens, self-hosted fonts and base layer; remove HeroUI"
```

---

### Task 0.4: Motion and DOM primitives

**Files:**
- Create: `src/shared/motion/tokens.ts`, `src/shared/motion/useMotionPrefs.ts`, `src/shared/hooks/useMediaQuery.ts`, `src/shared/lib/useSafeId.ts`
- Move: `src/features/users/hooks/useScrollLock.ts` → `src/shared/hooks/useScrollLock.ts`
- Modify: `src/features/users/components/discovery/UserDiscoveryPanel.tsx` (import path only)

**Interfaces:**
- Produces:
  - `spring.{press,release,arrive}`, `ease.{spring,out}`, `duration.{press,quick,base,arrive,peel,route,breath}`
  - `useMotionPrefs(): { reduced: boolean }`
  - `useMediaQuery(query: string): boolean`
  - `useSafeId(prefix: string): string` (safe inside `url(#…)`)
  - `useScrollLock(isLocked: boolean): void`

- [ ] **Step 1: Write the motion tokens**

**File:** `src/shared/motion/tokens.ts`

```ts
import type { Transition } from "framer-motion";

/**
 * Motion tokens — spec §4.5. The CSS mirrors live in src/styles/tokens.css.
 * Springs for things you touch, eases for things that arrive.
 */
export const spring = {
  press: { type: "spring", stiffness: 700, damping: 30 },
  release: { type: "spring", stiffness: 420, damping: 18 },
  arrive: { type: "spring", stiffness: 260, damping: 22 },
} as const satisfies Record<string, Transition>;

export const ease = {
  spring: [0.34, 1.56, 0.64, 1],
  out: [0.16, 1, 0.3, 1],
} as const;

/** Seconds, as Motion expects them. */
export const duration = {
  press: 0.09,
  quick: 0.22,
  base: 0.38,
  arrive: 0.48,
  peel: 0.56,
  route: 0.36,
  breath: 4.8,
} as const;
```

**File:** `src/shared/motion/useMotionPrefs.ts`

```ts
import { useReducedMotion } from "framer-motion";

/**
 * The one place components ask whether to animate. `MotionConfig` already
 * softens Motion animations for reduced-motion users; this hook is for the
 * things MotionConfig cannot see — loops, bursts, imperative animations.
 */
export function useMotionPrefs(): { reduced: boolean } {
  const reduced = useReducedMotion() ?? false;
  return { reduced };
}
```

- [ ] **Step 2: Write the DOM helpers**

**File:** `src/shared/hooks/useMediaQuery.ts`

```ts
import { useCallback, useSyncExternalStore } from "react";

/** Live `matchMedia` result. Server/first render falls back to `false`. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (notify: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", notify);
      return () => media.removeEventListener("change", notify);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
```

**File:** `src/shared/lib/useSafeId.ts`

```ts
import { useId } from "react";

/**
 * `useId()` with the punctuation stripped, so the result can be used inside
 * `url(#…)` references (clip paths, gradients) without escaping.
 */
export function useSafeId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}
```

- [ ] **Step 3: Move the scroll lock into shared hooks**

```bash
git mv src/features/users/hooks/useScrollLock.ts src/shared/hooks/useScrollLock.ts
```
Then in `src/features/users/components/discovery/UserDiscoveryPanel.tsx`, replace
`import { useScrollLock } from "../../hooks/useScrollLock";`
with
`import { useScrollLock } from "@/shared/hooks/useScrollLock";`

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/motion src/shared/hooks src/shared/lib/useSafeId.ts` → no errors.

```bash
git add -A src/shared/motion src/shared/hooks src/shared/lib/useSafeId.ts src/features/users
git commit -m "Add motion tokens, reduced-motion and media-query hooks"
```

---

### Task 0.5: Brand geometry and identity

**Files:**
- Create: `src/shared/brand/peel.ts`, `src/shared/brand/shapes.ts`, `src/shared/brand/identity.ts`

**Interfaces:**
- Produces:
  - `foldGeometry(width, radius, depth, curl?) → { clip: string; flap: string }`
  - `roundFold(cx, cy, r, inset) → { clip; flap }`
  - `type StickerShape`; `shapePath(shape, radius, seed?, steps?) → string`
  - `STICKER_COLORS`; `type StickerColor = { name; key; hex }`
  - `IDENTITY_SHAPES`; `type Identity = { hash; color; shape; tilt; seed }`
  - `hash32(value) → number`, `identityFor(key) → Identity`, `initialsFor(name) → string`

- [ ] **Step 1: Peel geometry**

**File:** `src/shared/brand/peel.ts`

```ts
export interface FoldGeometry {
  /** Keeps everything except the lifted corner. */
  clip: string;
  /** The folded-over flap: the mirror image of the lifted corner. */
  flap: string;
}

const f = (value: number): string => value.toFixed(2);

/**
 * Peel geometry for a rounded rectangle whose top-right corner is lifted.
 *
 * The rectangle's top-right corner sits at (width, 0). The fold runs from
 * (width − depth, 0) to (width, depth) with a slight curl; the flap is the
 * exact reflection of the removed rounded corner across the fold, so the
 * paper reads as folded flat rather than drawn on. `depth` is clamped to
 * stay just outside the corner radius.
 */
export function foldGeometry(width: number, radius: number, depth: number, curl = 0.09): FoldGeometry {
  const p = Math.max(depth, radius + 1);
  const ax = width - p;
  const ay = 0;
  const bx = width;
  const by = p;
  const k = (p * curl) / Math.SQRT2;
  const qx = (ax + bx) / 2 + k;
  const qy = (ay + by) / 2 - k;
  const r1x = width - p;
  const r1y = p - radius;
  const r2x = width - p + radius;
  const r2y = p;

  return {
    clip: `M-4000 -4000L${f(ax)} -4000L${f(ax)} ${f(ay)}Q${f(qx)} ${f(qy)} ${f(bx)} ${f(by)}L8000 ${f(by)}L8000 8000L-4000 8000Z`,
    flap: `M${f(ax)} ${f(ay)}L${f(r1x)} ${f(r1y)}A${radius} ${radius} 0 0 0 ${f(r2x)} ${f(r2y)}L${f(bx)} ${f(by)}Q${f(qx)} ${f(qy)} ${f(ax)} ${f(ay)}Z`,
  };
}

/**
 * Static peel for a round sticker: the segment beyond a chord at `inset`
 * from the centre, towards the bottom-right, is folded back.
 */
export function roundFold(cx: number, cy: number, r: number, inset: number): FoldGeometry {
  const k = cx + cy + inset * Math.SQRT2;
  const a = Math.acos(inset / r);
  const p1x = cx + r * Math.cos(Math.PI / 4 - a);
  const p1y = cy + r * Math.sin(Math.PI / 4 - a);
  const p2x = cx + r * Math.cos(Math.PI / 4 + a);
  const p2y = cy + r * Math.sin(Math.PI / 4 + a);

  return {
    clip: `M-400 -400L${f(k + 400)} -400L-400 ${f(k + 400)}Z`,
    flap: `M${f(p1x)} ${f(p1y)}A${r} ${r} 0 0 0 ${f(p2x)} ${f(p2y)}Z`,
  };
}
```

- [ ] **Step 2: Sticker silhouettes**

**File:** `src/shared/brand/shapes.ts`

```ts
export type StickerShape = "circle" | "squircle" | "flower" | "burst" | "clover" | "scallop" | "blob" | "heart";

const cache = new Map<string, string>();

function radialProfile(shape: StickerShape, t: number, seed: number): number {
  switch (shape) {
    case "burst":
      return 0.86 + 0.14 * Math.cos(8 * t);
    case "flower":
      return 0.84 + 0.16 * Math.cos(6 * t);
    case "clover":
      return 0.78 + 0.22 * Math.cos(4 * t);
    case "scallop":
      return 0.93 + 0.07 * Math.cos(14 * t);
    case "blob":
      return 0.86 + 0.08 * Math.cos(3 * t + seed) + 0.06 * Math.cos(5 * t + seed * 1.7);
    default:
      return 1;
  }
}

/**
 * Closed SVG path of a sticker silhouette centred on (0, 0) whose outer
 * radius is `radius`. `seed` only affects the blob. Results are cached.
 */
export function shapePath(shape: StickerShape, radius: number, seed = 0, steps = 144): string {
  const key = `${shape}:${radius}:${seed}:${steps}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let d = "";
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    let x: number;
    let y: number;

    if (shape === "squircle") {
      const c = Math.cos(t);
      const s = Math.sin(t);
      x = radius * 0.95 * Math.sign(c) * Math.sqrt(Math.abs(c));
      y = radius * 0.95 * Math.sign(s) * Math.sqrt(Math.abs(s));
    } else if (shape === "heart") {
      const s = Math.sin(t);
      x = (radius * 16 * s * s * s) / 17;
      y = (-radius * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) / 17 - radius * 0.13;
    } else {
      const r = radius * radialProfile(shape, t, seed);
      x = r * Math.cos(t);
      y = r * Math.sin(t);
    }

    d += `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }

  const path = `${d}Z`;
  cache.set(key, path);
  return path;
}
```

- [ ] **Step 3: Identity**

**File:** `src/shared/brand/identity.ts`

```ts
import type { StickerShape } from "./shapes";

export const STICKER_COLORS = [
  { name: "Electric Blue", key: "blue", hex: "#4da2ff" },
  { name: "Mint Pop", key: "mint", hex: "#55db9c" },
  { name: "Lavender", key: "lavender", hex: "#e9ccff" },
  { name: "Ember", key: "ember", hex: "#fb4903" },
  { name: "Sunburst", key: "sun", hex: "#ffd731" },
  { name: "Voltage Violet", key: "violet", hex: "#5c4ade" },
] as const;

export type StickerColor = (typeof STICKER_COLORS)[number];

export const IDENTITY_SHAPES = [
  "circle",
  "squircle",
  "flower",
  "burst",
  "clover",
  "scallop",
  "blob",
] as const satisfies readonly StickerShape[];

export type IdentityShape = (typeof IDENTITY_SHAPES)[number];

export interface Identity {
  hash: number;
  color: StickerColor;
  shape: IdentityShape;
  /** Degrees, −8…+8. */
  tilt: number;
  /** Only used by the blob shape. */
  seed: number;
}

/** FNV-1a, 32-bit. */
export function hash32(value: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const cache = new Map<string, Identity>();

/**
 * Every handle (or id, when no handle exists) resolves to one sticker:
 * a colour, a shape and a tilt. Nobody chooses it, and it costs zero
 * backend storage — spec §5.2.
 */
export function identityFor(key: string): Identity {
  const normalised = key.toLowerCase().trim() || "anon";
  const hit = cache.get(normalised);
  if (hit) return hit;

  const h = hash32(normalised);
  const identity: Identity = {
    hash: h,
    color: STICKER_COLORS[h % STICKER_COLORS.length],
    shape: IDENTITY_SHAPES[(h >>> 3) % IDENTITY_SHAPES.length],
    tilt: ((h >>> 9) % 17) - 8,
    seed: ((h >>> 13) % 628) / 100,
  };
  cache.set(normalised, identity);
  return identity;
}

/** Up to two initials from a display name or a handle. */
export function initialsFor(name: string): string {
  const parts = name
    .replace(/^@/, "")
    .split(/[\s._-]+/)
    .filter(Boolean);
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) || "?").toUpperCase();
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/brand` → no errors.

```bash
git add src/shared/brand/peel.ts src/shared/brand/shapes.ts src/shared/brand/identity.ts
git commit -m "Add peel geometry, sticker silhouettes and identity hashing"
```

---

### Task 0.6: Logo and PeelLoader

**Files:**
- Create: `src/shared/brand/Logo.tsx`, `src/shared/brand/PeelLoader.tsx`

**Interfaces:**
- Consumes: `WORD_PATH`, `GLYPH_A_PATH` (0.2), `foldGeometry`, `roundFold` (0.5), `useMotionPrefs` (0.4), `useSafeId` (0.4).
- Produces:
  - `<Logo variant? fill? ink? mono? interactive? slapIn? loop? tilt? outline? title? className? />` with `variant: "primary" | "symbol" | "round" | "horizontal"`
  - `<PeelLoader size?={number} label?={string} className? />`

- [ ] **Step 1: Write the logo**

**File:** `src/shared/brand/Logo.tsx`

```tsx
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import { useSafeId } from "@/shared/lib/useSafeId";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { GLYPH_A_PATH, WORD_PATH } from "./logoPaths";
import { foldGeometry, roundFold } from "./peel";

type StickerVariant = "primary" | "symbol";
export type LogoVariant = StickerVariant | "round" | "horizontal";

interface StickerSpec {
  width: number;
  height: number;
  radius: number;
  /** Peel depth at rest — equals x, the wordmark's x-height (spec §5.1). */
  rest: number;
  /** Peel depth on hover. */
  lift: number;
  tilt: number;
  viewBox: string;
  art: (fill: string) => ReactNode;
}

const SPECS: Record<StickerVariant, StickerSpec> = {
  primary: {
    width: 400,
    height: 170,
    radius: 52,
    rest: 64,
    lift: 96,
    tilt: -4,
    viewBox: "-24 -32 448 234",
    art: (fill) => <path d={WORD_PATH} transform="translate(41.3 117) scale(1.08)" style={{ fill }} />,
  },
  symbol: {
    width: 200,
    height: 200,
    radius: 56,
    rest: 64,
    lift: 100,
    tilt: 0,
    viewBox: "-16 -16 232 232",
    art: (fill) => <path d={GLYPH_A_PATH} transform="translate(35.04 151.75) scale(1.55)" style={{ fill }} />,
  },
};

const PEEL_SPRING = { type: "spring", stiffness: 380, damping: 16 } as const;

export interface LogoProps {
  variant?: LogoVariant;
  /** Sticker fill. The product always wears Electric Blue; other fills are landing-only. */
  fill?: string;
  /** Wordmark colour on the sticker. */
  ink?: string;
  /** One-colour version: ink sticker, ground-coloured letters. */
  mono?: boolean;
  /** Lift the corner on hover. */
  interactive?: boolean;
  /** Slap the sticker on once when it mounts, then lift the corner. */
  slapIn?: boolean;
  /** Keep the corner breathing — the brand loader. Symbol only. */
  loop?: boolean;
  /** Override the placement tilt in degrees (the app icon uses −6). */
  tilt?: number;
  /** Outline width in CSS pixels; constant at every size. */
  outline?: number;
  /** Accessible name. `null` marks the logo decorative. */
  title?: string | null;
  className?: string;
}

interface StickerLogoProps extends LogoProps {
  spec: StickerSpec;
  nested?: { x: number; y: number; width: number; height: number };
}

function StickerLogo({
  spec,
  nested,
  fill,
  ink,
  mono = false,
  interactive = false,
  slapIn = false,
  loop = false,
  tilt,
  outline = 1.5,
  title = "Aura",
  className,
}: StickerLogoProps) {
  const { reduced } = useMotionPrefs();
  const clipId = useSafeId("peel");
  const depth = useMotionValue(slapIn && !reduced ? spec.radius + 1 : spec.rest);
  const clip = useTransform(depth, (p) => foldGeometry(spec.width, spec.radius, p).clip);
  const flap = useTransform(depth, (p) => foldGeometry(spec.width, spec.radius, p).flap);

  const peelTo = (target: number) => {
    if (reduced) {
      depth.set(target);
      return;
    }
    animate(depth, target, PEEL_SPRING);
  };

  useEffect(() => {
    if (!loop || reduced) return;
    const low = spec.radius + 2;
    const high = spec.radius + 48;
    const controls = animate(depth, [low, high, low], { duration: 1.6, ease: "easeInOut", repeat: Infinity });
    return () => controls.stop();
  }, [loop, reduced, depth, spec.radius]);

  const bodyFill = mono ? "var(--ink)" : (fill ?? "var(--blue)");
  const letterFill = mono ? "var(--ground)" : (ink ?? "var(--carbon)");
  const edge = mono ? "var(--ink)" : "var(--carbon)";
  const flapFill = mono ? "var(--ground)" : "var(--paper)";
  const angle = tilt ?? spec.tilt;

  const body = (
    <g transform={`rotate(${angle} ${spec.width / 2} ${spec.height / 2})`}>
      <g clipPath={`url(#${clipId})`}>
        <rect width={spec.width} height={spec.height} rx={spec.radius} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} />
      </g>
      <motion.path d={flap} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} strokeLinejoin="round" />
      <g clipPath={`url(#${clipId})`}>
        <rect
          width={spec.width}
          height={spec.height}
          rx={spec.radius}
          style={{ fill: bodyFill, stroke: edge }}
          strokeWidth={outline}
          vectorEffect="non-scaling-stroke"
        />
        {spec.art(letterFill)}
      </g>
      <motion.path
        d={flap}
        style={{ fill: flapFill, stroke: edge }}
        strokeWidth={outline}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
      />
    </g>
  );

  return (
    <svg
      viewBox={spec.viewBox}
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
      onPointerEnter={interactive ? () => peelTo(spec.lift) : undefined}
      onPointerLeave={interactive ? () => peelTo(spec.rest) : undefined}
      {...nested}
    >
      <defs>
        <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
          <motion.path d={clip} />
        </clipPath>
      </defs>
      {slapIn && !reduced ? (
        <motion.g
          style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
          initial={{ opacity: 0, y: -24, rotate: -10, scaleX: 1.3, scaleY: 1.3 }}
          animate={{
            opacity: [0, 1, 1, 1],
            y: [-24, 0, 0, 0],
            rotate: [-10, 0, 0, 0],
            scaleX: [1.3, 1.07, 0.98, 1],
            scaleY: [1.3, 0.93, 1.02, 1],
          }}
          transition={{ duration: 0.62, times: [0, 0.55, 0.78, 1], ease: [0.2, 0.8, 0.2, 1] }}
          onAnimationComplete={() => peelTo(spec.rest)}
        >
          {body}
        </motion.g>
      ) : (
        body
      )}
    </svg>
  );
}

function RoundLogo({ fill, ink, mono = false, outline = 1.5, title = "Aura", className }: LogoProps) {
  const clipId = useSafeId("round");
  const { clip, flap } = roundFold(110, 110, 100, 80);
  const bodyFill = mono ? "var(--ink)" : (fill ?? "var(--blue)");
  const letterFill = mono ? "var(--ground)" : (ink ?? "var(--carbon)");
  const edge = mono ? "var(--ink)" : "var(--carbon)";

  return (
    <svg
      viewBox="-16 -16 252 252"
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={clip} />
        </clipPath>
      </defs>
      <g transform="rotate(-4 110 110)">
        <g clipPath={`url(#${clipId})`}>
          <circle cx={110} cy={110} r={100} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} />
        </g>
        <path d={flap} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={24} strokeLinejoin="round" />
        <g clipPath={`url(#${clipId})`}>
          <circle cx={110} cy={110} r={100} style={{ fill: bodyFill, stroke: edge }} strokeWidth={outline} vectorEffect="non-scaling-stroke" />
          <path d={WORD_PATH} transform="translate(24.5 129.2) scale(0.58)" style={{ fill: letterFill }} />
        </g>
        <path
          d={flap}
          style={{ fill: mono ? "var(--ground)" : "var(--paper)", stroke: edge }}
          strokeWidth={outline}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

function HorizontalLogo({ mono = false, outline = 1.5, interactive = false, title = "Aura", className }: LogoProps) {
  return (
    <svg
      viewBox="-12 -12 348 124"
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title ?? undefined}
      aria-hidden={title ? undefined : true}
    >
      <StickerLogo
        spec={SPECS.symbol}
        nested={{ x: -8, y: -8, width: 116, height: 116 }}
        mono={mono}
        outline={outline}
        interactive={interactive}
        title={null}
      />
      <path d={WORD_PATH} transform="translate(120 75.9) scale(0.742)" style={{ fill: "var(--ink)" }} />
    </svg>
  );
}

/**
 * The Aura logo — a die-cut sticker slapped on at −4°, lifting at its
 * top-right corner (spec §5.1). The wordmark is outlined, so the logo never
 * waits for a font.
 */
export function Logo({ variant = "primary", ...props }: LogoProps) {
  if (variant === "round") return <RoundLogo {...props} />;
  if (variant === "horizontal") return <HorizontalLogo {...props} />;
  return <StickerLogo spec={SPECS[variant]} {...props} />;
}
```

- [ ] **Step 2: Write the loader**

**File:** `src/shared/brand/PeelLoader.tsx`

```tsx
import { Logo } from "./Logo";

interface PeelLoaderProps {
  /** Square size in pixels. */
  size?: number;
  /** Announced to screen readers. */
  label?: string;
  className?: string;
}

/**
 * The brand loader: the symbol's corner peels up and settles in a loop.
 * Under reduced motion it holds still and still announces its label.
 */
export function PeelLoader({ size = 40, label = "Loading", className }: PeelLoaderProps) {
  return (
    <span role="status" aria-label={label} className={className} style={{ display: "inline-block", width: size, height: size }}>
      <Logo variant="symbol" loop title={null} className="h-full w-full" />
    </span>
  );
}
```

- [ ] **Step 3: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/brand` → no errors.

```bash
git add src/shared/brand/Logo.tsx src/shared/brand/PeelLoader.tsx src/shared/brand/logoPaths.ts
git commit -m "Add the die-cut sticker logo with live peel and the peel loader"
```

---

### Task 0.7: Stickers, glyphs and the identity sticker

**Files:**
- Create: `src/shared/brand/stickerPaths.ts`, `src/shared/brand/Sticker.tsx`, `src/shared/brand/glyphPaths.ts`, `src/shared/brand/Glyph.tsx`, `src/shared/brand/IdentitySticker.tsx`

**Interfaces:**
- Consumes: `shapePath` (0.5), `identityFor`, `initialsFor` (0.5), `DEFAULT_PROFILE_IMAGE` (`@/shared/config/constants`).
- Produces:
  - `type StickerName = "heart" | "bubble" | "bookmark" | "bell" | "share" | "sparkle" | "check" | "cross" | "bang" | "info"`
  - `STICKER_PATHS: Record<StickerName, { body: string[]; marks?: { d: string; fill?: boolean }[] }>`
  - `<Sticker name fill? size? tilt? outline? markColor? title? className? />`
  - `type GlyphName`; `<Glyph name size? strokeWidth? title? className? />`
  - `<IdentitySticker identityKey name photo? size frame? label? className? />`

- [ ] **Step 1: Sticker path data**

**File:** `src/shared/brand/stickerPaths.ts`

```ts
export type StickerName = "heart" | "bubble" | "bookmark" | "bell" | "share" | "sparkle" | "check" | "cross" | "bang" | "info";

export interface StickerArt {
  /** Filled silhouette parts, drawn with the sticker fill and black outline. */
  body: string[];
  /** Marks drawn on top (a tick, a cross); `fill` marks are dots. */
  marks?: { d: string; fill?: boolean }[];
}

const CIRCLE = "M10 50a40 40 0 1 0 80 0a40 40 0 1 0 -80 0Z";

/** 100 × 100 artboards — the flat counterparts of the inflated 3D objects. */
export const STICKER_PATHS: Record<StickerName, StickerArt> = {
  heart: {
    body: ["M50 86 C22 66 8 52 8 34 C8 20 19 10 32 10 C40 10 46 14 50 21 C54 14 60 10 68 10 C81 10 92 20 92 34 C92 52 78 66 50 86 Z"],
  },
  bubble: {
    body: ["M31 78.9 A38 38 0 1 0 17.1 65 Q14 82 8 94 Q22 88 31 78.9 Z"],
  },
  bookmark: {
    body: ["M28 8 H72 Q80 8 80 16 V88 Q80 94 75 91 L50 74 L25 91 Q20 94 20 88 V16 Q20 8 28 8 Z"],
  },
  bell: {
    body: [
      "M41 78 A9 9 0 0 0 59 78 Z",
      "M45 11a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z",
      "M50 14 C34 14 25 27 25 43 V58 Q25 63 21 67 L15 73 Q12 78 18 78 H82 Q88 78 85 73 L79 67 Q75 63 75 58 V43 C75 27 66 14 50 14 Z",
    ],
  },
  share: {
    body: [
      "M15.36 75 A40 40 0 1 1 84.64 75 L91.57 79 L67.85 86.09 L62.12 62 L69.05 66 A22 22 0 1 0 30.95 66 A9 9 0 0 1 15.36 75 Z",
    ],
  },
  sparkle: {
    body: ["M50 6 C53 36 64 47 94 50 C64 53 53 64 50 94 C47 64 36 53 6 50 C36 47 47 36 50 6 Z"],
  },
  check: { body: [CIRCLE], marks: [{ d: "M32 51 L45 64 L69 38" }] },
  cross: { body: [CIRCLE], marks: [{ d: "M36 36 L64 64 M64 36 L36 64" }] },
  bang: { body: [CIRCLE], marks: [{ d: "M50 30 V54" }, { d: "M45 68a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z", fill: true }] },
  info: { body: [CIRCLE], marks: [{ d: "M50 46 V70" }, { d: "M45 32a5 5 0 1 0 10 0a5 5 0 1 0 -10 0Z", fill: true }] },
};
```

- [ ] **Step 2: Sticker component**

**File:** `src/shared/brand/Sticker.tsx`

```tsx
import { STICKER_PATHS, type StickerName } from "./stickerPaths";

export interface StickerProps {
  name: StickerName;
  /** Any colour value; sticker palette tokens such as `var(--ember)`. */
  fill?: string;
  /** Pixel size (square). Omit to size with CSS. */
  size?: number;
  /** Degrees. Decoration only — UI stickers stay at 0. */
  tilt?: number;
  /** Black outline in CSS pixels — 1.5 for UI, 3 for display stickers. */
  outline?: number;
  /** Colour of the tick / cross / dot marks. */
  markColor?: string;
  /** Accessible name; omit for decorative stickers. */
  title?: string;
  className?: string;
}

/**
 * A flat die-cut sticker. On Night paper it gains a bone die-cut edge from
 * `--cut`; on Paper that edge is transparent.
 */
export function Sticker({
  name,
  fill = "var(--blue)",
  size,
  tilt = 0,
  outline = 1.5,
  markColor = "var(--carbon)",
  title,
  className,
}: StickerProps) {
  const art = STICKER_PATHS[name];

  return (
    <svg
      viewBox="-10 -10 120 120"
      width={size}
      height={size}
      className={className}
      overflow="visible"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
    >
      <g style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={14} strokeLinejoin="round">
        {art.body.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g style={{ fill, stroke: "var(--carbon)" }} strokeWidth={outline} strokeLinejoin="round">
        {art.body.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {art.marks?.map((mark) =>
        mark.fill ? (
          <path key={mark.d} d={mark.d} style={{ fill: markColor }} />
        ) : (
          <path
            key={mark.d}
            d={mark.d}
            style={{ fill: "none", stroke: markColor }}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ),
      )}
    </svg>
  );
}
```

- [ ] **Step 3: Glyph path data**

**File:** `src/shared/brand/glyphPaths.ts`

```ts
export interface GlyphPart {
  d: string;
  /** Filled part (dots) instead of a stroke. */
  fill?: boolean;
}

/** 24 × 24 line glyphs, drawn for a 1.75px round stroke. */
export const GLYPH_PATHS = {
  plus: [{ d: "M12 5v14M5 12h14" }],
  close: [{ d: "M6 6l12 12M18 6L6 18" }],
  search: [{ d: "M11 4.5a6.5 6.5 0 1 1 0 13a6.5 6.5 0 1 1 0-13Z" }, { d: "M16 16l4.5 4.5" }],
  more: [
    { d: "M3.4 12a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z", fill: true },
    { d: "M10.4 12a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z", fill: true },
    { d: "M17.4 12a1.6 1.6 0 1 0 3.2 0a1.6 1.6 0 1 0 -3.2 0Z", fill: true },
  ],
  "arrow-left": [{ d: "M19 12H5M11 6l-6 6 6 6" }],
  "arrow-right": [{ d: "M5 12h14M13 6l6 6-6 6" }],
  "arrow-up-right": [{ d: "M7 17L17 7M9 7h8v8" }],
  "chevron-down": [{ d: "M6 9l6 6 6-6" }],
  camera: [
    { d: "M6 7h1.5L9 4h6l1.5 3H18a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3Z" },
    { d: "M12 10a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7Z" },
  ],
  image: [
    { d: "M6 4h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" },
    { d: "M8.5 7.7a1.8 1.8 0 1 1 0 3.6a1.8 1.8 0 1 1 0-3.6Z" },
    { d: "M21 16l-5-5-9 9" },
  ],
  trash: [{ d: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" }],
  edit: [{ d: "M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" }],
  send: [{ d: "M4 12L20 4l-5 16-3-7-8-1Z" }],
  eye: [
    { d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" },
    { d: "M12 9a3 3 0 1 1 0 6a3 3 0 1 1 0-6Z" },
  ],
  "eye-off": [
    { d: "M3 3l18 18" },
    { d: "M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2" },
    { d: "M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6" },
    { d: "M9.9 9.9a3 3 0 0 0 4.2 4.2" },
  ],
  logout: [{ d: "M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" }],
  sun: [
    { d: "M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8Z" },
    { d: "M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" },
  ],
  moon: [{ d: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" }],
  wall: [{ d: "M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z" }],
  people: [
    { d: "M9 4.5a3.5 3.5 0 1 1 0 7a3.5 3.5 0 1 1 0-7Z" },
    { d: "M2.5 20a6.5 6.5 0 0 1 13 0" },
    { d: "M17 6.5a2.5 2.5 0 1 1 0 5a2.5 2.5 0 1 1 0-5Z" },
    { d: "M17 14.5a5 5 0 0 1 4.5 5" },
  ],
  bell: [{ d: "M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15L6 16Z" }, { d: "M10 20a2 2 0 0 0 4 0" }],
  user: [{ d: "M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8Z" }, { d: "M4 21a8 8 0 0 1 16 0" }],
  link: [
    { d: "M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" },
    { d: "M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" },
  ],
  check: [{ d: "M5 12.5l4.5 4.5L19 7.5" }],
  alert: [
    { d: "M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z" },
    { d: "M12 7.5v5.5" },
    { d: "M10.8 16.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0 -2.4 0Z", fill: true },
  ],
  lock: [{ d: "M7 11h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z" }, { d: "M8 11V8a4 4 0 0 1 8 0v3" }],
  mail: [{ d: "M6 5h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" }, { d: "M4 7l8 6 8-6" }],
  calendar: [{ d: "M7 5h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Z" }, { d: "M4 10h16M9 3v4M15 3v4" }],
  at: [{ d: "M12 8a4 4 0 1 1 0 8a4 4 0 1 1 0-8Z" }, { d: "M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" }],
  sliders: [
    { d: "M4 7h9M17 7h3M4 17h3M11 17h9" },
    { d: "M15 5a2 2 0 1 1 0 4a2 2 0 1 1 0-4Z" },
    { d: "M9 15a2 2 0 1 1 0 4a2 2 0 1 1 0-4Z" },
  ],
  refresh: [{ d: "M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4" }],
} satisfies Record<string, GlyphPart[]>;

export type GlyphName = keyof typeof GLYPH_PATHS;
```

- [ ] **Step 4: Glyph component**

**File:** `src/shared/brand/Glyph.tsx`

```tsx
import { GLYPH_PATHS, type GlyphName } from "./glyphPaths";

interface GlyphProps {
  name: GlyphName;
  size?: number;
  strokeWidth?: number;
  /** Accessible name; omit when the glyph sits next to visible text. */
  title?: string;
  className?: string;
}

/** Line glyph for UI chrome, drawn in the stickers' geometry. Inherits `currentColor`. */
export function Glyph({ name, size = 20, strokeWidth = 1.75, title, className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPH_PATHS[name].map((part) =>
        "fill" in part && part.fill ? (
          <path key={part.d} d={part.d} fill="currentColor" stroke="none" />
        ) : (
          <path key={part.d} d={part.d} />
        ),
      )}
    </svg>
  );
}
```

- [ ] **Step 5: Identity sticker**

**File:** `src/shared/brand/IdentitySticker.tsx`

```tsx
import { useState } from "react";
import { DEFAULT_PROFILE_IMAGE } from "@/shared/config/constants";
import { identityFor, initialsFor } from "./identity";
import { shapePath } from "./shapes";

export interface IdentityStickerProps {
  /** Handle (preferred) or id — the hash input. */
  identityKey: string;
  /** Display name, for initials. */
  name: string;
  photo?: string | null;
  /** Pixel size of the whole sticker. */
  size: number;
  /** Draw the identity frame behind the photo. */
  frame?: boolean;
  /** Accessible name; omit when the name is shown next to it. */
  label?: string;
  className?: string;
}

/**
 * A person's identity sticker: their deterministic colour and shape behind
 * their photo, or behind their initials when there is no photo — spec §5.2.
 * The initials render first and the photo fades in over them once decoded.
 */
export function IdentitySticker({ identityKey, name, photo, size, frame = true, label, className }: IdentityStickerProps) {
  const identity = identityFor(identityKey);
  const path = shapePath(identity.shape, 46, identity.seed);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src = photo && photo !== DEFAULT_PROFILE_IMAGE ? photo : null;
  const showPhoto = src !== null && failedSrc !== src;
  const ratio = frame ? (size < 48 ? 0.72 : 0.66) : 1;
  const inner = Math.round(size * ratio);

  return (
    <span
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ position: "relative", display: "inline-grid", placeItems: "center", width: size, height: size, flexShrink: 0 }}
    >
      {frame ? (
        <svg
          viewBox="-50 -50 100 100"
          overflow="visible"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `rotate(${identity.tilt}deg)` }}
        >
          <path d={path} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={8} strokeLinejoin="round" />
          <path
            d={path}
            style={{ fill: identity.color.hex, stroke: "var(--carbon)" }}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <span
        className="relative grid place-items-center overflow-hidden rounded-full border border-carbon bg-paper text-carbon"
        style={{ width: inner, height: inner }}
      >
        <span className="font-bold leading-none tracking-[-0.02em]" style={{ fontSize: Math.max(10, inner * 0.36) }}>
          {initialsFor(name)}
        </span>
        {showPhoto ? (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            loading="lazy"
            draggable={false}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setFailedSrc(src)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: loadedSrc === src ? 1 : 0 }}
          />
        ) : null}
      </span>
    </span>
  );
}
```

- [ ] **Step 6: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/brand` → no errors.

```bash
git add src/shared/brand
git commit -m "Add flat stickers, line glyphs and the identity sticker"
```

---

### Task 0.8: 3D object art pipeline

**Files:**
- Create: `../brand-lab/tools/objects.cjs`, `src/shared/brand/objectFallbacks.ts`, `src/shared/brand/ObjectArt.tsx`
- Generate: `src/assets/objects/{name}-{480,960}.{avif,webp}`, `src/assets/objects/{name}-480.png`, `src/assets/objects/manifest.ts`

**Interfaces:**
- Consumes: `Sticker` (0.7).
- Produces:
  - `OBJECTS: Record<ObjectName, { width: number; height: number }>`; `type ObjectName = "bubble" | "heart" | "bookmark" | "share" | "bell" | "bubble-deflated" | "bell-deflated" | "bookmark-deflated" | "bubble-popped"`
  - `<ObjectArt name sizes? priority? alt? className? />`

- [ ] **Step 1: Write the processor**

**File:** `../brand-lab/tools/objects.cjs`

```js
// Trims, resizes and encodes the inflated 3D renders for the app.
// Sources: renders/ (real alpha) and renders/cut/ (background removed with
// @imgly/background-removal-node, valves preserved). Output: app/src/assets/objects.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const R = (s) => path.join(__dirname, "../renders", `ChatGPT Image Sep 23, 2026, ${s} AM.png`);
const CUT = (s) => path.join(__dirname, "../renders/cut", `${s}.png`);

const SOURCES = {
  bubble: R("02_49_38"),
  heart: R("02_50_08"),
  bookmark: R("02_50_51"),
  share: R("02_51_41"),
  bell: CUT("02_52_23"),
  "bubble-deflated": CUT("02_54_52"),
  "bell-deflated": CUT("02_55_22"),
  "bookmark-deflated": CUT("02_55_55"),
  "bubble-popped": R("02_58_35"),
};

const OUT = path.resolve(__dirname, "../../app/src/assets/objects");

async function alphaBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = 0, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = {};

  for (const [name, file] of Object.entries(SOURCES)) {
    const box = await alphaBox(file);
    const margin = Math.round(Math.max(box.width, box.height) * 0.04);
    const trimmed = await sharp(file)
      .ensureAlpha()
      .extract(box)
      .extend({ top: margin, bottom: margin, left: margin, right: margin, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    for (const width of [480, 960]) {
      const resized = sharp(trimmed).resize({ width, withoutEnlargement: false });
      await resized.clone().avif({ quality: 52, effort: 6 }).toFile(path.join(OUT, `${name}-${width}.avif`));
      await resized.clone().webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(path.join(OUT, `${name}-${width}.webp`));
      if (width === 480) {
        await resized.clone().png({ compressionLevel: 9, palette: true, quality: 92 }).toFile(path.join(OUT, `${name}-480.png`));
      }
      if (width === 960) {
        const meta = await sharp(await resized.clone().png().toBuffer()).metadata();
        manifest[name] = { width: meta.width, height: meta.height };
      }
    }

    const avif = fs.statSync(path.join(OUT, `${name}-960.avif`)).size;
    console.log(name.padEnd(18), `avif@960 ${(avif / 1024).toFixed(1)} KB`, manifest[name]);
  }

  const lines = [
    "/* Generated by brand-lab/tools/objects.cjs. Do not edit by hand. */",
    "",
    "/** Intrinsic size of each object at 960w, for layout-stable images. */",
    "export const OBJECTS = {",
    ...Object.entries(manifest).map(([name, d]) => `  ${JSON.stringify(name)}: { width: ${d.width}, height: ${d.height} },`),
    "} as const;",
    "",
    "export type ObjectName = keyof typeof OBJECTS;",
    "",
  ];
  fs.writeFileSync(path.join(OUT, "manifest.ts"), lines.join("\n"));
  console.log("wrote manifest.ts");
})();
```

- [ ] **Step 2: Run it and check sizes**

Run: `cd ../brand-lab && node tools/objects.cjs`
Expected: 9 lines, each `avif@960` ≤ ~80 KB, and `src/assets/objects/manifest.ts` created. If any AVIF exceeds 80 KB, lower its `quality` to 45 and re-run.

- [ ] **Step 3: Fallback mapping**

**File:** `src/shared/brand/objectFallbacks.ts`

```ts
import type { ObjectName } from "@/assets/objects/manifest";
import type { StickerName } from "./stickerPaths";

/** The flat sticker drawn when an object image cannot load — no broken images, no layout shift. */
export const OBJECT_FALLBACKS: Record<ObjectName, { sticker: StickerName; fill: string }> = {
  bubble: { sticker: "bubble", fill: "var(--blue)" },
  heart: { sticker: "heart", fill: "var(--ember)" },
  bookmark: { sticker: "bookmark", fill: "var(--sun)" },
  share: { sticker: "share", fill: "var(--violet)" },
  bell: { sticker: "bell", fill: "var(--mint)" },
  "bubble-deflated": { sticker: "bubble", fill: "var(--band-mist)" },
  "bell-deflated": { sticker: "bell", fill: "var(--band-mist)" },
  "bookmark-deflated": { sticker: "bookmark", fill: "var(--band-mist)" },
  "bubble-popped": { sticker: "bubble", fill: "var(--lavender)" },
};
```

- [ ] **Step 4: ObjectArt component**

**File:** `src/shared/brand/ObjectArt.tsx`

```tsx
import { useState } from "react";
import { OBJECTS, type ObjectName } from "@/assets/objects/manifest";
import { OBJECT_FALLBACKS } from "./objectFallbacks";
import { Sticker } from "./Sticker";

const FILES = import.meta.glob<string>("/src/assets/objects/*.{avif,webp,png}", {
  eager: true,
  query: "?url",
  import: "default",
});

const fileUrl = (name: ObjectName, width: 480 | 960, ext: "avif" | "webp" | "png") =>
  FILES[`/src/assets/objects/${name}-${width}.${ext}`];

export interface ObjectArtProps {
  name: ObjectName;
  /** `sizes` attribute — how wide the image renders. */
  sizes?: string;
  /** The landing hero's LCP object loads eagerly with high priority. */
  priority?: boolean;
  /** Empty for decorative objects (the default). */
  alt?: string;
  className?: string;
}

/**
 * One inflated 3D object (spec §5.4): AVIF, then WebP, then PNG, with its
 * intrinsic size declared so nothing shifts. If it fails to load, the flat
 * sticker of the same object takes its place.
 */
export function ObjectArt({ name, sizes = "(max-width: 640px) 60vw, 480px", priority = false, alt = "", className }: ObjectArtProps) {
  const [failed, setFailed] = useState(false);
  const { width, height } = OBJECTS[name];

  if (failed) {
    const fallback = OBJECT_FALLBACKS[name];
    return <Sticker name={fallback.sticker} fill={fallback.fill} outline={2} title={alt || undefined} className={className} />;
  }

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={`${fileUrl(name, 480, "avif")} 480w, ${fileUrl(name, 960, "avif")} 960w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${fileUrl(name, 480, "webp")} 480w, ${fileUrl(name, 960, "webp")} 960w`} sizes={sizes} />
      <img
        src={fileUrl(name, 480, "png")}
        width={width}
        height={height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        onError={() => setFailed(true)}
        className="block h-auto w-full select-none"
      />
    </picture>
  );
}
```

- [ ] **Step 5: Verify and commit**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/shared/brand` → no errors.

```bash
git add src/assets/objects src/shared/brand/ObjectArt.tsx src/shared/brand/objectFallbacks.ts
git commit -m "Add processed 3D object art and the ObjectArt component"
```

---

### Task 0.9: Favicons, app icons and OG image

**Files:**
- Create: `../brand-lab/tools/icons.cjs`
- Generate: `public/favicon.svg`, `public/icons/icon-32.png`, `public/icons/apple-touch-icon.png`, `public/icons/icon-512.png`, `public/og.png`

**Interfaces:**
- Consumes: `src/shared/brand/logoPaths.ts` (read as text), `../brand-lab/out/headline.json` (0.2), `src/assets/objects/*-960.webp` (0.8).

- [ ] **Step 1: Write the icon generator**

**File:** `../brand-lab/tools/icons.cjs`

```js
// Builds the favicon, app icons and the OG image from the outlined logo.
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const APP = path.resolve(__dirname, "../../app");
const paths = fs.readFileSync(path.join(APP, "src/shared/brand/logoPaths.ts"), "utf8");
const WORD = paths.match(/WORD_PATH =\s*"([^"]+)"/)[1];
const GLYPH = paths.match(/GLYPH_A_PATH =\s*"([^"]+)"/)[1];
const headline = JSON.parse(fs.readFileSync(path.join(__dirname, "../out/headline.json"), "utf8"));

const f = (v) => v.toFixed(2);
function fold(w, rx, p, curl = 0.09) {
  const ax = w - p, bx = w, by = p, k = (p * curl) / Math.SQRT2;
  const qx = (ax + bx) / 2 + k, qy = by / 2 - k;
  return {
    clip: `M-4000 -4000L${f(ax)} -4000L${f(ax)} 0Q${f(qx)} ${f(qy)} ${f(bx)} ${f(by)}L8000 ${f(by)}L8000 8000L-4000 8000Z`,
    flap: `M${f(ax)} 0L${f(ax)} ${f(p - rx)}A${rx} ${rx} 0 0 0 ${f(ax + rx)} ${f(p)}L${f(bx)} ${f(by)}Q${f(qx)} ${f(qy)} ${f(ax)} 0Z`,
  };
}

// Stroke widths here are in user units (librsvg ignores non-scaling-stroke).
function symbol({ id, stroke, tilt = 0, peel = 64 }) {
  const g = fold(200, 56, peel);
  return `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${g.clip}"/></clipPath></defs>
  <g transform="rotate(${tilt} 100 100)">
    <g clip-path="url(#${id})"><rect width="200" height="200" rx="56" fill="#4da2ff" stroke="#000" stroke-width="${stroke}"/>
    <path d="${GLYPH}" transform="translate(35.04 151.75) scale(1.55)" fill="#000"/></g>
    <path d="${g.flap}" fill="#fff" stroke="#000" stroke-width="${stroke}" stroke-linejoin="round"/>
  </g>`;
}

function primary({ id, stroke }) {
  const g = fold(400, 52, 64);
  return `<defs><clipPath id="${id}" clipPathUnits="userSpaceOnUse"><path d="${g.clip}"/></clipPath></defs>
  <g transform="rotate(-4 200 85)">
    <g clip-path="url(#${id})"><rect width="400" height="170" rx="52" fill="#4da2ff" stroke="#000" stroke-width="${stroke}"/>
    <path d="${WORD}" transform="translate(41.3 117) scale(1.08)" fill="#000"/></g>
    <path d="${g.flap}" fill="#fff" stroke="#000" stroke-width="${stroke}" stroke-linejoin="round"/>
  </g>`;
}

(async () => {
  fs.mkdirSync(path.join(APP, "public/icons"), { recursive: true });

  const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-8 -8 216 216">${symbol({ id: "f", stroke: 8, peel: 72 })}</svg>`;
  fs.writeFileSync(path.join(APP, "public/favicon.svg"), favicon);
  await sharp(Buffer.from(favicon)).resize(32, 32).png().toFile(path.join(APP, "public/icons/icon-32.png"));

  const appIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#dceeff"/>
    <g transform="translate(90 90) scale(1.66)">${symbol({ id: "a", stroke: 4, tilt: -6 })}</g></svg>`;
  await sharp(Buffer.from(appIcon)).resize(512, 512).png().toFile(path.join(APP, "public/icons/icon-512.png"));
  await sharp(Buffer.from(appIcon)).resize(180, 180).png().toFile(path.join(APP, "public/icons/apple-touch-icon.png"));

  // OG: Sky Wash wall, crushed headline, the logo sticker, and three objects.
  // The widest line fills at most 600px; crushed 0.78 leading like the display type.
  const widest = Math.max(...headline.map((line) => line.bbox[2]));
  const scale = Math.min(1.4, 600 / widest);
  const lineHeight = 78 * scale;
  const firstBaseline = 64 + 67.5 * scale;
  const text = headline
    .map((line, i) => `<path d="${line.d}" transform="translate(72 ${firstBaseline + i * lineHeight}) scale(${scale})" fill="#000"/>`)
    .join("");
  const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#dceeff"/>${text}
    <g transform="translate(78 468) scale(0.62)">${primary({ id: "o", stroke: 4 })}</g></svg>`;
  const obj = (name, width) => sharp(path.join(APP, `src/assets/objects/${name}-960.webp`)).resize({ width }).png().toBuffer();
  await sharp(Buffer.from(og))
    .composite([
      { input: await obj("bubble", 470), left: 690, top: 150 },
      { input: await obj("heart", 230), left: 930, top: 40 },
      { input: await obj("bookmark", 170), left: 640, top: 400 },
    ])
    .png()
    .toFile(path.join(APP, "public/og.png"));

  console.log("wrote favicon.svg, icons/icon-32.png, icons/icon-512.png, icons/apple-touch-icon.png, og.png");
})();
```

- [ ] **Step 2: Run it and look**

Run: `cd ../brand-lab && node tools/icons.cjs`
Expected: the five files are written. Open `public/og.png` and `public/icons/icon-512.png` in the browser (`/og.png`, `/icons/icon-512.png` on the dev server) and check them:
- the headline is readable and doesn't overlap the objects;
- the logo sits bottom-left;
- the app icon has an even margin.

Adjust the translate values if needed.

- [ ] **Step 3: Commit**

```bash
git add public/favicon.svg public/icons public/og.png
git commit -m "Add favicon, app icons and OG image from the outlined logo"
```

---

### Task 0.10: Archive the Accession Card docs

**Files:**
- Move (repo): `PRODUCT.md`, `DESIGN.md`, `docs/brand-board.html`, `docs/brand-guidelines.md`, `docs/design-tokens.css`, `docs/design-tokens.json` → `docs/archive/2026-accession-card/`
- Move (outside repo): `../PRODUCT.md`, `../DESIGN.md`, `../docs/*` (except `archive`) → `../docs/archive/2026-accession-card/`

- [ ] **Step 1: Archive inside the repo**

```bash
mkdir -p docs/archive/2026-accession-card
git mv PRODUCT.md DESIGN.md docs/archive/2026-accession-card/
git mv docs/brand-board.html docs/brand-guidelines.md docs/design-tokens.css docs/design-tokens.json docs/archive/2026-accession-card/
```

- [ ] **Step 2: Add a pointer so tools and readers find the new source of truth**

**File:** `docs/archive/2026-accession-card/README.md`

```md
# Archived — The Accession Card (2026)

This brand and design system was cancelled on 2026-09-23 and replaced by the
Aura sticker rebrand. Nothing in this folder is binding.

Current source of truth: `docs/superpowers/specs/2026-09-23-aura-sticker-rebrand-design.md`.
New `PRODUCT.md` and `DESIGN.md` are written at the end of Phase 5.
```

- [ ] **Step 3: Archive the root copies (not tracked by git)**

```bash
mkdir -p ../docs/archive/2026-accession-card && mv ../PRODUCT.md ../DESIGN.md ../docs/archive/2026-accession-card/ && for f in ../docs/*; do [ "$(basename "$f")" = archive ] || mv "$f" ../docs/archive/2026-accession-card/; done
```

- [ ] **Step 4: Commit**

```bash
git add -A docs PRODUCT.md DESIGN.md
git commit -m "Archive the Accession Card brand documents"
```

---

### Task 0.11: Dev-only kit page (brand section)

**Files:**
- Create: `src/pages/kit/KitPage.tsx`, `src/pages/kit/BrandSection.tsx`, `src/pages/kit/KitBlock.tsx`
- Modify: `src/app/router/router.tsx` (dev-only `/__kit` route)

**Interfaces:**
- Consumes: everything from 0.3–0.8; `readTheme`, `setTheme`, `type Theme` from `@/shared/lib/theme`.
- Produces:
  - `/__kit` route (development only)
  - `<KitBlock title note? children />` — layout helper reused by Phase 1

- [ ] **Step 1: Layout helper**

**File:** `src/pages/kit/KitBlock.tsx`

```tsx
import type { ReactNode } from "react";

interface KitBlockProps {
  title: string;
  note?: string;
  children: ReactNode;
}

/** One labelled specimen block on the kit page. */
export function KitBlock({ title, note, children }: KitBlockProps) {
  return (
    <section className="grid gap-5 border-t border-line pt-6">
      <header className="grid gap-1">
        <h3 className="type-heading-sm">{title}</h3>
        {note ? <p className="max-w-[70ch] type-caption text-ink-2">{note}</p> : null}
      </header>
      {children}
    </section>
  );
}
```

- [ ] **Step 2: Brand section**

**File:** `src/pages/kit/BrandSection.tsx`

```tsx
import { useState } from "react";
import { OBJECTS, type ObjectName } from "@/assets/objects/manifest";
import { Glyph } from "@/shared/brand/Glyph";
import { GLYPH_PATHS, type GlyphName } from "@/shared/brand/glyphPaths";
import { IdentitySticker } from "@/shared/brand/IdentitySticker";
import { Logo } from "@/shared/brand/Logo";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { PeelLoader } from "@/shared/brand/PeelLoader";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { KitBlock } from "./KitBlock";

const SWATCHES = [
  ["ground", "bg-ground"],
  ["surface", "bg-surface"],
  ["surface-2", "bg-surface-2"],
  ["band-sky", "bg-band-sky"],
  ["band-concrete", "bg-band-concrete"],
  ["band-lav", "bg-band-lav"],
  ["band-mist", "bg-band-mist"],
  ["ink", "bg-ink"],
  ["action", "bg-action"],
  ["blue", "bg-blue"],
  ["ember", "bg-ember"],
  ["sun", "bg-sun"],
  ["violet", "bg-violet"],
  ["mint", "bg-mint"],
  ["lavender", "bg-lavender"],
] as const;

const STICKERS: [StickerName, string][] = [
  ["bubble", "var(--blue)"],
  ["heart", "var(--ember)"],
  ["bookmark", "var(--sun)"],
  ["share", "var(--violet)"],
  ["bell", "var(--mint)"],
  ["sparkle", "var(--lavender)"],
  ["check", "var(--mint)"],
  ["cross", "var(--ember)"],
  ["bang", "var(--sun)"],
  ["info", "var(--sky)"],
];

const SAMPLE_HANDLES = ["leila.harb", "idris.okafor", "maya.s", "noor_ali", "sam.k", "yousef.dev"];

export function BrandSection() {
  const [slapKey, setSlapKey] = useState(0);

  return (
    <div className="grid gap-16">
      <h2 className="type-display">Brand</h2>

      <KitBlock title="Logo" note="Hover lifts the corner. Slap-in replays on demand. Primary, symbol, round, horizontal, one-colour.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid min-h-64 place-items-center rounded-card border border-line bg-band-sky p-8">
            <Logo key={slapKey} interactive slapIn className="w-full max-w-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid place-items-center rounded-card border border-line bg-surface p-4 sm:p-6">
              <Logo variant="symbol" interactive className="w-full max-w-28" />
            </div>
            <div className="grid place-items-center rounded-card border border-line bg-band-lav p-4 sm:p-6">
              <Logo variant="round" className="w-full max-w-32" />
            </div>
            <div className="grid place-items-center rounded-card border border-line bg-surface p-4 sm:p-6">
              <Logo variant="symbol" mono interactive className="w-full max-w-24" />
            </div>
            <div className="grid place-items-center rounded-card border border-line bg-band-concrete p-4 sm:p-6">
              <Logo variant="horizontal" interactive className="w-full max-w-44" />
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setSlapKey((k) => k + 1)} className="justify-self-start rounded-pill border border-line bg-surface px-4 py-2 type-label">
          Replay slap-in
        </button>
      </KitBlock>

      <KitBlock title="Peel loader">
        <div className="flex items-end gap-6">
          <PeelLoader size={20} />
          <PeelLoader size={32} />
          <PeelLoader size={56} />
          <PeelLoader size={96} />
        </div>
      </KitBlock>

      <KitBlock title="Colour" note="Semantic tokens flip with the theme; sticker fills never do.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="grid gap-2">
              <div className={`h-16 rounded-chip border border-line ${cls}`} />
              <span className="type-caption">{name}</span>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Type">
        <div className="grid gap-6">
          <p className="type-display-xl">Aura</p>
          <p className="type-poster">Wall</p>
          <p className="type-display">This one popped</p>
          <p className="type-heading">Everything here breathes.</p>
          <p className="type-heading-sm">Post details</p>
          <p className="max-w-[62ch] type-body-lg">A post is flat until someone breathes into it. A like inflates it, a comment gives it volume.</p>
          <p className="max-w-[62ch] type-body">Painted the balcony door sunflower yellow. The neighbours have opinions.</p>
          <p className="type-caption text-ink-2">2h · 14 likes · 3 comments</p>
          <p className="type-label">Follow · Save · Share</p>
          <p className="tnum type-heading-sm">0123456789</p>
        </div>
      </KitBlock>

      <KitBlock title="Stickers" note="Flat counterparts of the 3D objects. Night paper adds the bone die-cut edge.">
        <div className="flex flex-wrap items-end gap-6">
          {STICKERS.map(([name, fill]) => (
            <div key={name} className="grid justify-items-center gap-2">
              <Sticker name={name} fill={fill} size={64} outline={2} />
              <span className="type-caption">{name}</span>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Glyphs">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-12">
          {(Object.keys(GLYPH_PATHS) as GlyphName[]).map((name) => (
            <div key={name} className="grid justify-items-center gap-2 rounded-chip border border-line bg-surface p-3">
              <Glyph name={name} size={24} />
              <span className="type-caption text-ink-2">{name}</span>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Identity sticker" note="Sample handles — demonstration only. Same handle, same sticker.">
        <div className="flex flex-wrap items-end gap-6">
          {SAMPLE_HANDLES.map((handle, i) => (
            <div key={handle} className="grid justify-items-center gap-2">
              <IdentitySticker identityKey={handle} name={handle} size={[32, 40, 64, 96, 128, 64][i]} />
              <span className="type-caption">@{handle}</span>
            </div>
          ))}
          <div className="grid justify-items-center gap-2">
            <IdentitySticker identityKey="broken.photo" name="Broken Photo" photo="data:image/png;base64,bm90LWFuLWltYWdl" size={64} />
            <span className="type-caption">photo fails → initials</span>
          </div>
        </div>
      </KitBlock>

      <KitBlock title="3D objects" note="AVIF → WebP → PNG, lazy, with intrinsic sizes.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(OBJECTS) as ObjectName[]).map((name) => (
            <figure key={name} className="grid gap-2 rounded-card border border-line bg-band-sky p-4">
              <ObjectArt name={name} sizes="240px" />
              <figcaption className="type-caption">{name}</figcaption>
            </figure>
          ))}
        </div>
      </KitBlock>
    </div>
  );
}
```

- [ ] **Step 3: Kit page shell**

**File:** `src/pages/kit/KitPage.tsx`

```tsx
import { useState, type MouseEvent } from "react";
import { Logo } from "@/shared/brand/Logo";
import { readTheme, setTheme, type Theme } from "@/shared/lib/theme";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { BrandSection } from "./BrandSection";

/** Development-only specimen page for the Aura design system. */
export default function KitPage() {
  const [theme, setThemeState] = useState<Theme>(() => readTheme());
  const { reduced } = useMotionPrefs();

  const toggleTheme = (event: MouseEvent<HTMLButtonElement>) => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const rect = event.currentTarget.getBoundingClientRect();
    setTheme(next, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setThemeState(next);
  };

  return (
    <div className="min-h-dvh bg-ground text-ink">
      <header className="sticky top-0 z-(--z-sticky) flex items-center gap-4 border-b border-line bg-ground px-4 py-3 sm:px-8">
        <Logo interactive className="h-10 w-auto" />
        <span className="type-label">Kit · dev only</span>
        <span className="ml-auto hidden type-caption text-ink-2 sm:inline">{reduced ? "Reduced motion on" : "Full motion"}</span>
        <button type="button" onClick={toggleTheme} className="rounded-pill border border-line bg-surface px-4 py-2 type-label">
          {theme === "dark" ? "Paper" : "Night paper"}
        </button>
      </header>
      <main className="mx-auto grid max-w-(--page-max) gap-24 px-4 py-12 sm:px-8 sm:py-16">
        <BrandSection />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Register the dev-only route**

In `src/app/router/router.tsx`:
1. Below the other lazy imports, add:
```tsx
/** Development-only design-system specimen page; compiled out of production builds. */
const KitPage = import.meta.env.DEV ? lazy(() => import("@/pages/kit/KitPage")) : null;
```
2. Replace `export const router = createBrowserRouter([` … `]);` so the array ends with the kit route:
```tsx
const devRoutes = KitPage ? [{ path: "/__kit", element: lazyRoute(<KitPage />) }] : [];

export const router = createBrowserRouter([
  // …the two existing top-level route objects, unchanged…
  ...devRoutes,
]);
```

- [ ] **Step 5: Verify in the browser**

Run: `npm run typecheck` → exit 0. Run: `npx eslint src/pages/kit src/app/router src/shared` → no new errors (only the 3 baseline errors in old `shared/ui`).
Browser `/__kit`, at 375, 768, 1280 and 1440 in Paper and in Night:
- The logo slaps in and lifts on hover; replay works.
- The loaders peel continuously.
- Every sticker, glyph, identity sticker and object renders. The failed-photo sample shows initials.
- In Night, the stickers and logos show the bone die-cut edge.
- No horizontal page scroll at 375. No console errors.
- With the OS reduced-motion setting on, nothing loops or slaps.

Also open `/auth/login` to confirm the old page still works.

- [ ] **Step 6: Commit**

```bash
git add src/pages/kit src/app/router/router.tsx
git commit -m "Add dev-only kit page with the brand primitives"
```
