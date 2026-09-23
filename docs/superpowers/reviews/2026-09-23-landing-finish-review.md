# Finish review — Aura landing and app pages (Phase 4 → Phase 5)

> Run in-thread from `impeccable/reference/degraded/finish-reviewer.md`. This harness has no `impeccable-finish-reviewer` agent type.
>
> **Inputs that were missing or partial:**
> - No approved comp and no image generation. The direction is user-pinned (spec §2, hero H2).
> - Screenshots are partial, because the browser pane is hidden: animations freeze at their first frame, and some captures crop. Layout was verified by DOM measurement at 375 / 768 / 1280 / 1440.

**disposition: fix**

## persistence

**Pass.**
- `PRODUCT.md` was written this run, from the approved spec.
- `DESIGN.md` doesn't exist yet. That's expected: this is a new surface inside an established world, and it gets documented after this review.
- There are no comps under `.impeccable/mocks/`.

## fidelity

Judged against the contract and OWN-WORLD, since there is no comp.

| Element | Verdict |
|---|---|
| Marquee band | match |
| Floating ink pill nav | match. The section links appear only from `md` up — adaptation for phone width. |
| Sky wall, five objects and the logo slapping on | match. The bell is hidden below `lg` — adaptation for phone space. |
| `EVERYTHING HERE / BREATHES` fitted to full width | match |
| Lede, Join Aura (sun sticker) and Sign in inside the first viewport | match (CTA bottom measured at 735 / 703 / 810 / 805 against viewport heights 812 / 1024 / 860 / 900) |
| How it feels: pinned sample post, like → comment → save → share | match. Under reduced motion it shows the static finished state — adaptation (PRODUCT.md accessibility). |
| Your sticker: live preview → Claim it → register pre-fill | match (verified: "@luna.x" → `username=luna.x`) |
| The wall: feature stickers | match |
| Join band and honest footer | match |
| Footer Night-paper switch | added without approval (minor; the spec puts the theme switch in the You menu and Settings) |
| **TYPE**: Anybody 900 at wdth 100/124, crushed 0.8 leading, fitted lines | match |
| **MATERIAL**: rendered AVIF/WebP inflated objects, die-cut SVG logo | match. No imitation material. |
| Profile poster: the handle sits as an eyebrow above the name | contradicted (craft floor: kicker/eyebrow ban) |

## ceiling

- The logo's peel on hover — the brand signature — isn't used on the landing's largest logo.
- Deflated → inflated, the brand's core idea ("empty is just waiting for breath"), never plays on the landing. The join band only scales its objects.
- The display face's width axis ("type that inflates", allowed on the landing by spec §14) is never animated.

## material_fixes

1. **Floor:** the profile handle is set as an eyebrow above the name poster. Move it under the name, and retire `PosterHeader`'s `eyebrow` prop.
2. **Floor / world:** replies hang behind a 2px left rule, but the world's line weight is 1px.
3. **Product accessibility** (PRODUCT.md: 44px targets): `sm` buttons, `sm` icon buttons, the action pills and the `sm` segments measure 32–40px. Extend their hit areas to 44px without changing their drawn size.
4. **Spec §11:** fonts aren't preloaded, and react-dom (about half of the entry chunk) sits outside the independently cached `react` chunk.
5. **Spec §11 (LCP):** guests wait for the lazy landing chunk until after the entry runs. Start it in parallel for visitors without a session.
6. **Ceiling:** the hero logo isn't `interactive` (no peel on hover).
7. **Ceiling:** the join band's objects should start deflated and inflate as the band arrives. Use the real deflated renders; there's no deflated heart, so it uses the bookmark and the bubble.

## keep

The poster type scale, and the real 3D objects slapped over the headline. Don't shrink them or push them apart while fixing.

## Verdict pass (after the fix batch)

Scored against what the recapture actually shows. Where the hidden pane can't show something, the score says how it was checked.

### verdict

| # | Finding | Result |
|---|---|---|
| 1 | Eyebrow above the profile name | **resolved.** The kit profile sample renders the `h1` with no sibling before it and `@idris.okafor` after it. `PosterHeader` no longer has an `eyebrow` prop. |
| 2 | 2px reply rule | **resolved.** `border-l` (1px). |
| 3 | Touch targets | **resolved.** Computed `::after` insets: `sm` button 36px → 44px, `sm` icon button 36 → 44, action pill 40 → 44, `sm` follow 36 → 44 (it no longer clips with `overflow-hidden`; its layers are rounded themselves). The `sm` segments reach about 40px, because they are clipped by their own scroll container. |
| 4 | Font preload and react-dom chunk | **resolved.** `dist/index.html` preloads the Anybody and Onest woff2 files. The entry chunk went from 255 kB to 74 kB (82.5 → 25.7 kB gzipped); react-dom now sits in the cached `react` chunk. |
| 5 | Landing chunk for guests | **resolved.** An inline head script modulepreloads `LandingPage-*.js` when there's no stored token. |
| 6 | Hero logo peel on hover | **resolved in code** (`interactive`). Hover can't be exercised in the hidden pane. |
| 7 | Deflated → inflated join band | **partial.** The code swaps the deflated renders (bookmark, bubble) for the inflated ones as the band arrives. The scroll-linked crossfade couldn't be seen, because the pane is hidden and frames are paused. |

### remaining

- #7 needs a visual check in a visible browser.
- The ceiling item "type that inflates" (animating the width axis) was not attempted.
- The `sm` segments' 40px target.

**disposition: fix** (one partial remains; the user decides whether to fund another round)

## Detector

`detect.mjs` reported `bounce-easing` for `cubic-bezier(0.34, 1.56, 0.64, 1)` (tokens.css ×2, transitions.css ×2). **Accepted, not fixed:** this overshoot is the brand's locked "sticker physics" easing (brand sheet §Sticker physics, spec §4.5 `--ease-spring`) for release, like, save, arrive and slap-in. The brief wins over the pattern warning.
