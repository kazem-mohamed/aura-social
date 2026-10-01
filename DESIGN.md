---
name: Aura
description: The sticker wall — everything here breathes.
colors:
  carbon: "#000000"
  paper: "#ffffff"
  electric-blue: "#4da2ff"
  ember: "#fb4903"
  sunburst: "#ffd731"
  voltage-violet: "#5c4ade"
  mint-pop: "#55db9c"
  lavender: "#e9ccff"
  sky-wash: "#dceeff"
  concrete: "#cccccc"
  mist: "#e9e9e9"
  paper-surface-2: "#f2f2f2"
  ink-2: "#3a3a3a"
  ink-3: "#6b6b6b"
  night: "#111114"
  night-sky: "#0d1826"
  night-lavender: "#1d1729"
  night-surface: "#18181c"
  night-surface-2: "#222227"
  bone: "#f6f5f0"
  bone-2: "#b8b7b0"
  bone-3: "#8a8984"
typography:
  display-xl:
    fontFamily: "Anybody Variable, Arial Black, Impact, system-ui, sans-serif"
    fontSize: "clamp(96px, 21vw, 360px)"
    fontWeight: 900
    lineHeight: 0.76
    letterSpacing: "-0.015em"
    fontVariation: "'wdth' 124"
  display:
    fontFamily: "Anybody Variable, Arial Black, Impact, system-ui, sans-serif"
    fontSize: "clamp(52px, 9vw, 150px)"
    fontWeight: 900
    lineHeight: 0.8
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 112"
  poster:
    fontFamily: "Anybody Variable, Arial Black, Impact, system-ui, sans-serif"
    fontSize: "clamp(56px, 11vw, 176px)"
    fontWeight: 900
    lineHeight: 0.78
    letterSpacing: "-0.01em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(30px, 3.4vw, 52px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(22px, 2vw, 28px)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body-lg:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "-0.01em"
  caption:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
  label:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.032em"
rounded:
  chip: "16px"
  card: "24px"
  card-lg: "40px"
  pill: "999px"
spacing:
  gutter-phone: "16px"
  gutter: "32px"
  card-padding: "24px"
  reading: "640px"
  page-max: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-sticker:
    backgroundColor: "{colors.sunburst}"
    textColor: "{colors.carbon}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.pill}"
    height: "52px"
    padding: "0 12px 0 18px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.carbon}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  dock:
    backgroundColor: "{colors.carbon}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "6px"
---

# Design System: Aura

## Overview

**Creative North Star: "The Sticker Wall"**

Aura is a wall of paper that people cover in stickers. Every surface is paper, and every piece of content or control is a die-cut sticker: a flat shape with a 1px carbon outline, slapped on at a slight tilt. The six sticker colours are loud because they are the objects, not the background. The grounds stay quiet: white Paper by day and near-black Night paper by night, with washes of sky, lavender or concrete marking the big bands.

Depth never comes from shadows. It comes from overlap, tilt, and the inflated 3D objects (bubble, heart, bookmark, share loop, bell), which stand for the social actions and swell with scroll and breath. Type does the shouting: crushed, uppercase Anybody 900 is set as a poster and fitted edge to edge. The Onest UI text beneath it stays calm and readable.

Motion is sticker physics. Things slap on from a tilt, squash, settle, peel at a corner, inflate when loved and deflate when empty. Every loop pauses off screen, and everything collapses to an instant state change under reduced motion.

**Key Characteristics:**
- Paper grounds, 1px carbon outlines, no shadows, no gradients.
- Six sticker fills (blue, ember, sun, violet, mint, lavender) that belong to objects, never to backgrounds of text.
- Poster type (Anybody 900, uppercase, 0.76–0.8 leading), fitted to its box and never wrapped.
- Pills and rounded die-cuts: `pill` controls, `card` surfaces, `card-lg` sheets.
- Identity stickers: each person's colour, shape and tilt come from their handle.
- Inflated 3D renders as the signature imagery; deflated and popped variants for empty and missing states.

## Colors

A quiet paper ground carrying six loud sticker colours, with an ink action colour that flips between the themes.

### Primary
- **Carbon** (#000000): ink, outlines, and the action colour on Paper — the dock, primary buttons, the guest nav pill and the marquee band. Night paper swaps it for Bone.
- **Electric Blue** (#4da2ff): the logo sticker, always. Also the comment bubble and one identity colour. Never an action colour.

### Secondary
- **Sunburst** (#ffd731): the landing's call-to-action sticker ("Join Aura"), the composer's + button in the dock, the save fill, the counter's warning, "Sample" tags, and the closing band on the landing.
- **Ember** (#fb4903): like and alert fills, error rings and unread dots. Carbon text only.

### Tertiary
- **Voltage Violet** (#5c4ade): the share fill and the violet call-to-action sticker. The only sticker colour that takes Paper-white text.
- **Mint Pop** (#55db9c): "Following", met password rules, the success tick and the toggle when on.
- **Lavender** (#e9ccff): the Your-sticker band on Paper and one identity colour.

### Neutral
- **Paper** (#ffffff): the Paper ground and surface.
- **Paper Surface 2** (#f2f2f2): hover fills and inset rows (the top comment, the quoted post).
- **Ink 2** (#3a3a3a) / **Ink 3** (#6b6b6b): secondary and tertiary text on Paper (5.3:1 or better).
- **Sky Wash** (#dceeff), **Concrete** (#cccccc), **Mist** (#e9e9e9): band grounds.
- **Night** (#111114), **Night Sky** (#0d1826), **Night Lavender** (#1d1729), **Night Surface** (#18181c), **Night Surface 2** (#222227): the Night paper equivalents.
- **Bone** (#f6f5f0) with **Bone 2** (#b8b7b0) and **Bone 3** (#8a8984): ink, outlines and the action colour on Night paper. In Night, a sticker's die-cut edge also turns Bone.

### Named Rules
**The Sticker Colours Are Objects Rule.** Sticker fills colour things you can touch — buttons, badges, shapes, 3D objects — and whole bands. They never tint body text, and gray is never used on a coloured surface: text on a sticker is Carbon (Paper only on Violet).

**The Blue Is The Logo Rule.** Electric Blue is never a call to action. The Sunburst sticker and the ink pill carry actions.

## Typography

**Display Font:** Anybody Variable (with Arial Black, Impact)
**Body Font:** Onest Variable (with the system UI sans)

**Character:** A crushed, extended, uppercase display face set as poster lettering, over a friendly round-shouldered grotesque that keeps every sentence effortless.

### Hierarchy
- **Display XL** (900, clamp(96px, 21vw, 360px), 0.76, wdth 124): a person's name on their profile.
- **Display** (900, clamp(52px, 9vw, 150px), 0.8, wdth 112): landing section titles, 404, "This one popped".
- **Poster** (900, clamp(56px, 11vw, 176px), 0.78, wdth 112): every member page's `h1` (Wall, People, Alerts, Settings, Welcome back).
- **Fitted poster lines** (900, wdth 100–124): landing headlines. Each line is sized to span its box exactly, capped at 22–30% of the viewport height.
- **Headline** (700, clamp(30px, 3.4vw, 52px), 1.02): section headings such as "Comments" and the story steps.
- **Title** (700, clamp(22px, 2vw, 28px), 1.1): card and sheet titles, and short text-only posts.
- **Body large** (500, 17px, 1.4): post text and ledes, at most 44–56ch.
- **Body** (500, 15px, 1.45): comments and UI copy.
- **Caption** (500, 13px, 1.5): handles, times and hints.
- **Label** (700, 12px, 0.032em, uppercase): buttons, chips, tabs and the marquee.

### Named Rules
**The One Line Poster Rule.** Poster type never wraps: it shrinks to fit its box (`useFitText`, `usePosterLines`). A poster headline that breaks across lines is a bug, unless it is deliberately set as separate fitted lines.

**The Handle Goes Under Rule.** No label, kicker or eyebrow sits above a heading. Context, including a person's handle, goes in the line beneath the poster.

**The Breathing Type Rule.** On the landing, and only there, poster lines inflate along Anybody's width axis (`stretch-breath`: the resting stretch × `--inflate`).
- **Hero:** the lines fill from 62% of their width to 100% as they slap on, and BREATHES keeps breathing, out to 94% and back every 4.8s, only while it is on screen.
- **Join band:** "Stick around" fills in step with its balloons.
- **Limits:** type never goes past its resting width (lines are fitted at rest), it never animates in lists, and it stays still under reduced motion.

## Layout

- **Page:** a 1440px maximum width, with 16px gutters on phones and 32px from 640px up.
- **Reading pages** (Wall, Post, Alerts, Settings) sit in a 640px column. People and Profile use the full width, and Profile's tabs and posts return to the 640px column.
- **Member pages** open with a poster header: 32px above it on phones, 48px from 640px up. There is no top bar. The floating dock owns navigation, so `main` keeps 144px of bottom padding to clear it.
- **Guest pages** share a floating pill nav at the top. On the landing it floats over the hero's sky band.
- **Landing:** full-bleed bands (Sky, Paper, Lavender, Paper, Sunburst, then the ink footer), each with 80–144px of vertical padding. "How it feels" is a 360vh section with a one-screen sticky stage.
- **Rhythm:** posts and cards are spaced 20px apart in lists; forms stack at 20px; poster headers leave 20px between the title and the lede.
- **Overflow:** tilted, arriving content never widens the page — `main` clips horizontally without becoming a scroll container.

## Elevation & Depth

Aura is flat. There are no box shadows anywhere. Depth comes from four things:
- **Overlap:** stickers and 3D objects slapped over headlines and card corners.
- **Tilt:** resting angles of ±3–12°, and −4° for the logo.
- **Scale:** the inflated objects swell with scroll and breathe.
- **The die-cut edge:** a Bone border that appears around stickers on Night paper.

Modals and sheets sit on a scrim (42% black on Paper, 60% on Night paper), never on a shadow.

### Named Rules
**The No Shadow Rule.** Nothing casts a shadow. When something must feel lifted, it overlaps, tilts or scales.

## Shapes

Everything is a pill or a rounded die-cut:
- **Pills** (999px): controls — buttons, fields, chips, segmented controls, the dock and the nav.
- **Chips** (16px): inset rows and images inside cards.
- **Cards** (24px): surfaces.
- **Large cards** (40px): sheets, auth cards, and the profile cover band.

Outlines are 1px Carbon (Bone on Night paper). The logo is a rounded die-cut rectangle with a peeling top-right corner.

Identity stickers use seven generated silhouettes: circle, squircle, flower, burst, clover, scallop and blob.

### Named Rules
**The One Pixel Rule.** Every outline, rule and thread line is 1px. Weight comes from fill and scale, never from thicker strokes.

## Components

### Buttons
Tactile and sticker-like: they lift and tilt on hover, squish on press, and spring back.
- **Shape:** pill (999px). Heights: 36px (`sm`, with a 44px touch area), 44px (`md`) and 56px (`lg`). Label type, uppercase.
- **Primary:** the ink pill (Carbon on Paper, Bone on Night paper) with inverse text.
- **Sticker:** Sunburst, Mint, Lavender or Violet fill with a Carbon outline — landing calls to action only.
- **Secondary / Ghost:** a Paper surface with a 1px outline, or transparent; both fill Surface 2 on hover.
- **Destructive:** Ember with Carbon text.
- **Loading:** the peel loader replaces the label and the width holds. **Success:** a tick replaces the leading icon.

### Chips
- **Style:** pill tags, outlined, in Label type. The **Sample** tag is Sunburst with Carbon text.
- **State:** the password rule list turns each met rule Mint with a tick.

### Cards / Containers
- **Corner Style:** 24px, or 40px for sheets.
- **Background:** Surface (Paper, or Night Surface).
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px line.
- **Internal Padding:** 20px on phones, 24px from 640px up.

### Inputs / Fields
- **Style:** a 52px pill with a 1px outline on Surface, and 16px text. Text areas grow with their content, with 24px corners.
- **Focus:** a 3px outline 3px outside the pill. On sign-up and "Your sticker" it takes the person's identity colour.
- **Error / Disabled:** an Ember outline, a shake, and a message with a cross sticker. Disabled fields are 50% opacity on Mist.

### Navigation
- **Dock (members):** a floating ink pill at the bottom centre on every breakpoint — Wall, People, a Sunburst + (new post), Alerts and You.
  - The current page wears a ground-coloured sticker that slides between items.
  - Labels show at 10px on phones, as tooltips on tablets, and inline from 1024px.
  - Items are 48px or larger.
- **Guest nav:** the dock's twin at the top — the logo, section links from 768px up, Sign in, and a Sunburst "Join Aura". It shares the dock's view-transition name, so signing in carries the pill down into the dock.

### Post card
A sticker on the wall.
- **Arrival:** on a feed it slaps on from −18px, ±6–7° and 1.06 scale as it scrolls into view, with a 70ms stagger.
- **Layout:** a 40px avatar in the identity frame, then words and one picture. A short text-only post is set as a Title.
- **Shared posts:** nested as a smaller Paper-ground sticker.
- **Actions:** like, comment and share on the left; save on the right.

### Identity sticker
A person's colour, shape and tilt, derived from their handle, sit behind their photo or their initials. It appears at 32, 40, 64 and 128px, and larger in previews. Only alerts omit the frame, because they carry no handle.

### Inflated objects
Rendered 3D objects (AVIF, WebP or PNG with intrinsic sizes) mark the big moments:
- **Hero and bands:** inflated objects.
- **Empty states:** deflated objects ("waiting for breath").
- **Missing things:** the popped bubble (404, deleted post).

On the landing they breathe (a 1.06 swell every 4.8s, only on screen) and inflate with scroll.

## Do's and Don'ts

### Do:
- **Do** outline every surface and sticker at 1px in Carbon (Bone on Night paper).
- **Do** set page titles in poster type fitted to one line, with context underneath.
- **Do** give every control a touch area of at least 44px (48px in the dock), even when it draws smaller.
- **Do** use the overshoot spring (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for things you touch and things that land, and the ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for things that arrive.
- **Do** label sample content "Sample", and show empty states as a deflated object with one useful action.
- **Do** collapse every animation to an instant state under reduced motion, and pause every loop off screen.

### Don't:
- **Don't** use box shadows, gradients, glass or blur.
- **Don't** make Electric Blue a call to action, or put coloured text on a sticker fill.
- **Don't** put a label, kicker or eyebrow above a heading.
- **Don't** draw outlines, rules or thread lines thicker than 1px.
- **Don't** use Unicode characters as icons. Glyphs are drawn SVG line icons at one stroke; sticker marks are drawn stickers.
- **Don't** let tilted or arriving content widen the page. Clip horizontally at `main`.
