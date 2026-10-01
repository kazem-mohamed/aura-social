# Product

<!-- impeccable:product-schema 1 -->

> Recorded 2026-09-23 from the owner's brief and the approved rebrand spec (`docs/superpowers/specs/2026-09-23-aura-sticker-rebrand-design.md`). Nothing here was invented for a page; open items are marked.

## Platform

web

## Users

- **Members** (signed in): people who post short text and pictures, react (like, comment, reply, share, save), follow others and check their alerts. Mostly on a phone, in short sessions, one thumb on the screen.
- **Visitors** (signed out): people arriving at `/` who need to understand what Aura is within one screen and decide whether to join. Many meet Aura as a portfolio piece.

## Product Purpose

Aura is a small social network: a wall of posts from everyone and from the people you follow. It is a portfolio project built on the Route Academy practice API (`route-posts.routemisr.com`).

Success looks like this:
- A visitor gets the idea in the first viewport and joins.
- A member posts and reacts with feedback they can feel, on any device and in either theme.

## Positioning

**Everything here breathes.** Every interaction has physical weight, and every action behaves like a sticker or a balloon: likes inflate, comments add volume, saves slap down and stick, follows peel, and empty things deflate.

Each person gets a deterministic identity sticker. Its colour, shape and tilt come from their handle. Nobody picks it, and it appears wherever that handle does.

## Operating Context

- The API is shared, rate-limited practice infrastructure. Don't add polling, and keep the existing cache and retry behaviour.
- Every piece of content requires a session. Guests can only see the landing page and the auth pages.
- The interface is English, left to right.

## Capabilities and Constraints

**What members can do:**
- Sign up, sign in, change password, sign out.
- Filter the feed by room: Everyone, Following, Yours, Saved.
- Create, edit and delete posts (text, one image, or both).
- Like, comment, reply, like comments, share with a caption, and save posts.
- Keep a profile: photo (cropped in the app) and cover upload, plus follow and unfollow.
- Search people and see suggestions.
- Read alerts, and mark one or all as read.
- Choose between Paper and Night paper themes.

**Not available** (never claim these):
- direct messages, stories, video, or OAuth sign-in;
- marking a selection of alerts as read;
- removing a cover on the server (removal is local only today).

**Other rules:**
- Names and usernames are capped at 15 characters by the API.
- No fabricated proof: no user counts, testimonials or metrics. Sample content is labelled "Sample".

## Brand Commitments

- **Name:** Aura, from the Greek αὔρα, "breath". **Tagline:** "Everything here breathes."
- **Logo:** a die-cut Electric Blue sticker with the outlined Anybody wordmark, placed at −4° and peeling at the top right.
- **Signature:** the project's own inflated 3D action objects — bubble, heart, bookmark, share loop, bell — plus deflated and popped variants.
- **Voice:** short, verbs first, warm, never snarky.
- **Themes:** Paper (default) and Night paper. The theme follows the system until the person chooses.
- **Brand sheet:** `../brand-lab/aura-brand-sheet.html` (outside this repo)

## Evidence on Hand

- Nine rendered 3D objects in `src/assets/objects/` (AVIF, WebP and PNG).
- **None of the following exist:** testimonials, press, usage numbers, or real member content that may be shown publicly.
- The footer states the truth: "A portfolio project built on the Route Academy practice API."

## Product Principles

1. **Feel before function.** Every action answers with motion that behaves like a real sticker or balloon.
2. **Identity without choosing.** Your sticker is derived, never picked.
3. **Empty is waiting, not broken.** Empty states show a deflated object and one useful action.
4. **Honest by default.** Sample content is labelled, and nothing claims a scale the product doesn't have.
5. **Thumb first.** The dock and every control work one-handed on a phone.

## Accessibility & Inclusion

- **WCAG 2.2 AA:**
  - text contrast of at least 4.5:1;
  - a visible focus ring;
  - touch targets of at least 44px (48px in the dock);
  - full keyboard support and a skip link.
- **Reduced motion:** every animation collapses to an instant state change. No loops, no parallax, no smooth scrolling, no pinned scroll stories.
