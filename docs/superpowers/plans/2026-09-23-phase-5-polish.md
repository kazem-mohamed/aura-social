# Aura Rebrand — Phase 5: Polish · Record

> Phase 5 is driven by findings rather than planned code up front. This file records what was checked, what changed and what stays open. The review and verdict are in `docs/superpowers/reviews/2026-09-23-landing-finish-review.md`.

**Spec:** §12 step 5 — the motion pass, then the responsive pass (4 breakpoints × 2 themes), then the quality pass (accessibility, performance, reduced motion, copy), and finally new `PRODUCT.md` / `DESIGN.md`.

## What was checked

- **Responsive** (by DOM measurement at 375 / 768 / 1280 / 1440, because screenshots are unreliable while the pane is hidden):
  - landing, auth pages, 404 and the kit page;
  - `scrollWidth` equals the viewport width everywhere;
  - the poster lines fit their box;
  - the call to action sits inside the first viewport.
- **Themes:** Paper and Night paper on the landing and the auth pages.
- **Motion:**
  - arrival, slap-in, breathing and the scroll story;
  - loops are gated by `useInView`;
  - every Motion element has a reduced-motion path in code: `initial={false}`, a static finished state, and no Lenis.
  - Reduced-motion emulation isn't available in this harness, so these paths were checked in code, not in the browser.
- **Mechanical:**
  - `detect.mjs`: only the brand's spring easing was flagged, and it is accepted;
  - a scan for craft-floor refusals: eyebrows, thick side rules, Unicode icons, blur;
  - `npm run typecheck`, `npm run lint`, `npm run build`.

## What changed

1. **The eyebrow is retired.** `PosterHeader` has no `eyebrow` prop. The profile handle and the kit sample use `lede`, under the name.
2. **The reply thread rule is 1px.**
3. **44px touch areas without resizing anything:**
   - an invisible `::after` on `sm` buttons, `sm` icon buttons and action pills, and vertically on `sm` segments;
   - the follow button's layers are rounded themselves, so it no longer needs `overflow-hidden`.
4. **`vite.config.ts`:**
   - `react-dom/client` and `react-router/dom` join the `react` chunk, which shrinks the entry chunk from 255 kB to 74 kB;
   - an `aura-head-hints` build plugin preloads the Anybody and Onest woff2 files and, for visitors without a token, modulepreloads the landing chunk.
5. **Hero logo** is `interactive`: it peels on hover.
6. **Join band:** the bookmark and the bubble start deflated and inflate as the band scrolls in (the real deflated renders crossfade into the inflated ones).
7. **Guest nav:** "Sign in" is a `NavLink`, so it carries `aria-current="page"`.
8. **Docs:**
   - `PRODUCT.md`, from the approved spec;
   - `DESIGN.md` and the `.impeccable/design.json` sidecar, recorded from the built system;
   - a direction contract comment in `index.html`, which survives the build.

## Write flows, end to end (2026-09-29/30)

Writing to the shared practice API was off the table, so every write ran against a mock of it inside the page. The mock swapped the adapter on the app's own axios instance, the app used a stand-in token, and an XHR guard dropped anything addressed to the real host. Nothing leaked.

Checked with the keyboard where it matters:
- posting (text, and an image from the dock sheet);
- like and save, including a forced failure that rolls back with a toast;
- the Saved room;
- comments, replies, comment and reply likes, edit and delete;
- sharing, with or without a line, and deleting a share;
- follow and unfollow, including a failure;
- People search;
- photo upload through the framer, and cover upload through its confirm;
- alerts with real items: mark one read, mark all read, and the dock badge counting down.

Fixed:
1. **Comment count.** A new comment didn't refresh the post's own comment count, so the post page read "Comments 1" beside "💬 0". Create now invalidates the post, as edit and delete already did.
2. **Disappearing reply.** A reply vanished when sending it opened the thread: the thread's first fetch landed mid-request and dropped the placeholder. When the placeholder is gone, the list is refetched.
3. **Focus that fell to the page, now kept.**
   - Closing an inline edit (post or comment) or a reply box: focus goes to the item's options button or its Reply button (`useRefocusOnClose`).
   - A dialog whose opener is gone (a deleted comment or post): focus goes to `main#content`.
   - Dialogs that open on an `autoFocus` field (Share, the composer): `useFocusTrap` now records the opener on the first render, and survives React StrictMode's double effects.
   - Loading buttons: `Button` uses `aria-disabled` plus a cancelled click, not `disabled`.
   - Emptied composers: focus goes back to the field.
   - Mark as read: focus goes to the alert. Mark all read: focus goes to the filter.
   - The photo input no longer disables itself mid-upload.
4. **Deleted posts.** They leave every cached list as soon as the server confirms, instead of lingering until the refetch.
5. **Assistive tech.**
   - `Counter` gives assistive tech one value while its digits roll.
   - Post and quoted images read "Image posted by …" instead of an empty `alt`.

## Still open

- The `sm` segments' touch area stops at about 40px, clipped by their own scroll container.
