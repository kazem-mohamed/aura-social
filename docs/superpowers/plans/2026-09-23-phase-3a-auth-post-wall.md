# Aura Rebrand — Phase 3a: Auth, Post page, Wall · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the first half of the member and guest pages on the Phase 1 kit and the Phase 2 shell (spec §9):
- **Sign in** ("WELCOME BACK") and **Register** ("JOIN THE WALL", with a live identity-sticker preview, a live password checklist and pre-fill from `location.state.handle`).
- One new **PostCard** for every list. It covers text, image and shared (nested quote) posts, like / comment / share / save, the owner's edit and delete, the share sheet, and the top-comment preview.
- The **Post page**, with comments, nested replies, likes and owner edit/delete.
- The **Wall**: poster, rooms, the inline composer, and designed loading, empty and error states.

Phase 3b covers Profile, People, Alerts, Settings, the 404 page and removing the legacy UI.

**Architecture:**
- Pages stay thin. Feature components live in `features/*/components` and compose `shared/kit`.
- Every data hook, schema, cache helper and API call is reused **unchanged**. Only presentation and feedback change: toasts replace inline alert boxes.
- The old `PostCard/*` and the comment components are replaced in place. `WorkPlate` and the generic `Wall` stay until Phase 3b rewrites the profile page, which still uses them.

**Tech Stack:** React 19, React Router 7, TanStack Query 5, react-hook-form + zod, framer-motion 12, Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-09-23-aura-sticker-rebrand-design.md` §6 (arrive, like, save, share motion), §7 (PostCard), §9 (pages). **Depends on:** Phases 0–2.

## Global Constraints

- Phase 1 and Phase 2 constraints apply:
  - no shadows or gradients, and ink text;
  - never put Tailwind translate or rotate utilities on a Motion-animated element;
  - honour reduced motion;
  - `.tsx` files export components only.
- Keep the logic: the same mutations, optimistic updates, guards, redirects (register → sign in after 1.2 s) and validation messages.
- Feedback goes through the kit toasts (`useToast().show`). Field errors stay on the fields.
- Reading pages (Wall, Post) sit in the 640px column, `max-w-(--reading)`.
- Verification:
  - `npm run typecheck`, and `npx eslint` on the changed paths.
  - In the browser, as a guest: `/auth/login` and `/auth/register` at 375 / 768 / 1280 in both themes, field errors, the live sticker and rules, and pre-fill through `history.state`.
  - Member pages need a session, and **the user signs in themselves**. Do not create posts or comments on the shared API without asking.

---

### Task 3.1: Sign in and Register

**Files:**
- Create: `src/features/auth/model/passwordRules.ts`, `src/features/auth/components/AuthFrame.tsx`, `src/features/auth/components/IdentityPreview.tsx`
- Modify (replace): `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`
- Delete: `src/features/auth/components/AuthTabs.tsx`

**Interfaces:**
- `passwordRules(value) → { label; met }[]`: mirrors `PASSWORD_REGEX`.
- `<AuthFrame title lede art footer>{form}</AuthFrame>`
- `<IdentityPreview username name size />`
- `LoginPage` reads `location.state.email`, which Register passes after sign-up.
- `RegisterPage` reads `location.state.handle`, which the landing page (Phase 4) passes.

- [ ] **Step 1: Password rules**

**File:** `src/features/auth/model/passwordRules.ts`

```ts
/**
 * The password rule (`PASSWORD_REGEX`) split into the parts people can watch
 * tick off as they type.
 */
export function passwordRules(value: string): { label: string; met: boolean }[] {
  return [
    { label: "8+ characters", met: value.length >= 8 },
    { label: "Uppercase", met: /[A-Z]/.test(value) },
    { label: "Lowercase", met: /[a-z]/.test(value) },
    { label: "Number", met: /[0-9]/.test(value) },
    { label: "Symbol", met: /[#?!@$ %^&*-]/.test(value) },
  ];
}
```

- [ ] **Step 2: The shared frame and the sticker preview**

**File:** `src/features/auth/components/AuthFrame.tsx`

```tsx
import type { ReactNode } from "react";
import { PosterHeader } from "@/shared/kit/PosterHeader";

interface AuthFrameProps {
  title: string;
  lede: ReactNode;
  /** Beside the form from 1024px up; hidden on smaller screens. */
  art: ReactNode;
  /** The line under the form card — the way to the other auth page. */
  footer: ReactNode;
  children: ReactNode;
}

/** Sign in and Register share one frame: the poster and its art on the left, the form card on the right. */
export function AuthFrame({ title, lede, art, footer, children }: AuthFrameProps) {
  return (
    <div className="grid gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-16">
      <div className="grid content-start">
        <PosterHeader title={title} lede={lede} />
        <div className="hidden lg:block">{art}</div>
      </div>
      <div className="grid content-start gap-5 lg:pt-12">
        <div className="rounded-card-lg border border-line bg-surface p-6 sm:p-8">{children}</div>
        <p className="text-center type-body text-ink-2">{footer}</p>
      </div>
    </div>
  );
}
```

**File:** `src/features/auth/components/IdentityPreview.tsx`

```tsx
import { motion } from "framer-motion";
import { identityFor } from "@/shared/brand/identity";
import { IdentitySticker } from "@/shared/brand/IdentitySticker";
import { spring } from "@/shared/motion/tokens";

interface IdentityPreviewProps {
  username: string;
  name: string;
  size: number;
}

/** The sticker this username will get. It slaps back on with every keystroke. */
export function IdentityPreview({ username, name, size }: IdentityPreviewProps) {
  const key = username.trim() || "you";
  const identity = identityFor(key);

  return (
    <motion.div
      key={key}
      className="inline-grid"
      initial={{ scale: 0.82, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={spring.release}
    >
      <IdentitySticker
        identityKey={key}
        name={name.trim() || key}
        size={size}
        label={`Your sticker: ${identity.color.name}, ${identity.shape}`}
      />
    </motion.div>
  );
}
```

- [ ] **Step 3: Sign in**

**File:** `src/pages/LoginPage.tsx`

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation } from "react-router";
import { getErrorMessage } from "@/shared/api/errors";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { Button } from "@/shared/kit/Button";
import { Field } from "@/shared/kit/Field";
import { PasswordField } from "@/shared/kit/PasswordField";
import { useToast } from "@/shared/kit/toast/useToast";
import { spring } from "@/shared/motion/tokens";
import { routes } from "@/app/router/routes";
import { AuthFrame } from "@/features/auth/components/AuthFrame";
import { useSignIn } from "@/features/auth/hooks/useAuthMutations";
import { loginSchema, type LoginFormValues } from "@/features/auth/model/auth.schemas";

/** Sign in. The guest guard moves you to the wall the moment the token lands. */
export default function LoginPage() {
  const location = useLocation();
  const signIn = useSignIn();
  const toast = useToast();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: { email, password: "" },
  });

  // mutateAsync, not mutate: the page unmounts as soon as the session starts,
  // and mutate's own callbacks are dropped once their component is gone.
  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn.mutateAsync(values);
      toast.show({ tone: "success", title: "Welcome back." });
    } catch (error) {
      toast.show({
        tone: "error",
        title: "Couldn’t sign you in",
        description: getErrorMessage(error, "Check your email and password, then try again."),
      });
    }
  };

  return (
    <AuthFrame
      title="Welcome back"
      lede="Your sticker’s right where you left it."
      art={
        <motion.div
          className="mt-4 w-[min(360px,72%)]"
          initial={{ opacity: 0, scale: 1.3, rotate: -18 }}
          animate={{ opacity: 1, scale: 1, rotate: -6 }}
          transition={{ ...spring.release, delay: 0.12 }}
        >
          <ObjectArt name="heart" sizes="360px" />
        </motion.div>
      }
      footer={
        <>
          New here?{" "}
          <Link to={routes.register} viewTransition className="font-bold text-ink underline decoration-1 underline-offset-4">
            Join the wall
          </Link>
        </>
      }
    >
      <form noValidate aria-label="Sign in" onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field
              {...field}
              label="Email"
              type="email"
              iconStart="mail"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              label="Password"
              autoComplete="current-password"
              placeholder="Your password"
              error={errors.password?.message}
            />
          )}
        />
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} className="mt-1">
          Sign in
        </Button>
      </form>
    </AuthFrame>
  );
}
```

- [ ] **Step 4: Register**

**File:** `src/pages/RegisterPage.tsx`

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router";
import { getErrorMessage } from "@/shared/api/errors";
import { identityFor } from "@/shared/brand/identity";
import { latestDateForMinimumAge, parseDateInput, toIsoDateOnly } from "@/shared/lib/dates";
import { Button } from "@/shared/kit/Button";
import { DateField } from "@/shared/kit/DateField";
import { Field } from "@/shared/kit/Field";
import { PasswordField } from "@/shared/kit/PasswordField";
import { RadioPills } from "@/shared/kit/RadioPills";
import { RuleList } from "@/shared/kit/RuleList";
import { useToast } from "@/shared/kit/toast/useToast";
import { routes } from "@/app/router/routes";
import { AuthFrame } from "@/features/auth/components/AuthFrame";
import { IdentityPreview } from "@/features/auth/components/IdentityPreview";
import { useSignUp } from "@/features/auth/hooks/useAuthMutations";
import { registerSchema, type RegisterFormValues } from "@/features/auth/model/auth.schemas";
import { passwordRules } from "@/features/auth/model/passwordRules";

const REDIRECT_DELAY_MS = 1200;
/** Name and username are both capped at 15 by the API schema. */
const MAX_NAME = 15;

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

/** Join. The username you type decides your sticker, live, before you commit to it. */
export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const signUp = useSignUp();
  const toast = useToast();
  const [joined, setJoined] = useState(false);
  const claimed = (location.state as { handle?: string } | null)?.handle ?? "";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      username: claimed.replace(/^@/, "").slice(0, MAX_NAME),
      email: "",
      password: "",
      rePassword: "",
      gender: undefined,
      dateOfBirth: undefined,
    },
  });

  const [name, username, password] = useWatch({ control, name: ["name", "username", "password"] });
  const identity = identityFor(username.trim() || "you");

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await signUp.mutateAsync({
        name: values.name,
        username: values.username,
        email: values.email,
        dateOfBirth: toIsoDateOnly(values.dateOfBirth),
        gender: values.gender,
        password: values.password,
        rePassword: values.rePassword,
      });
      setJoined(true);
      toast.show({ tone: "success", title: "You’re on the wall.", description: "Sign in to stick around." });
      // A beat to see the tick, then on to sign in with the email filled in.
      window.setTimeout(() => navigate(routes.login, { state: { email: values.email }, viewTransition: true }), REDIRECT_DELAY_MS);
    } catch (error) {
      toast.show({
        tone: "error",
        title: "Couldn’t create your account",
        description: getErrorMessage(error, "Check the fields above and try again."),
      });
    }
  };

  return (
    <AuthFrame
      title="Join the wall"
      lede="Pick a username. It picks your sticker."
      art={
        <figure className="mt-2 grid justify-items-start gap-5">
          <IdentityPreview username={username} name={name} size={240} />
          <figcaption className="max-w-[38ch] type-body text-ink-2">
            <span className="font-bold text-ink capitalize">
              {identity.color.name} · {identity.shape}.
            </span>{" "}
            Your username decides the colour and the shape. Nobody picks it — not even you.
          </figcaption>
        </figure>
      }
      footer={
        <>
          Already have a sticker?{" "}
          <Link to={routes.login} viewTransition className="font-bold text-ink underline decoration-1 underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form noValidate aria-label="Join Aura" onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
        <div className="flex items-center gap-4 lg:hidden">
          <IdentityPreview username={username} name={name} size={72} />
          <p className="type-caption text-ink-2">
            <span className="block text-[15px] font-bold text-ink capitalize">
              {identity.color.name} · {identity.shape}
            </span>
            Your username picks your sticker.
          </p>
        </div>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Field
              {...field}
              label="Name"
              autoComplete="name"
              placeholder="What people call you"
              maxLength={MAX_NAME}
              counter={{ value: name.length, max: MAX_NAME }}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <Field
              {...field}
              label="Username"
              iconStart="at"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="your.handle"
              maxLength={MAX_NAME}
              counter={{ value: username.length, max: MAX_NAME }}
              ringColor={identity.color.hex}
              error={errors.username?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Field
              {...field}
              label="Email"
              type="email"
              iconStart="mail"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
            />
          )}
        />
        <div className="grid gap-3">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                label="Password"
                autoComplete="new-password"
                placeholder="Choose a password"
                error={errors.password?.message}
              />
            )}
          />
          <RuleList rules={passwordRules(password)} />
        </div>
        <Controller
          name="rePassword"
          control={control}
          render={({ field }) => (
            <PasswordField
              {...field}
              label="Repeat password"
              autoComplete="new-password"
              placeholder="Same again"
              error={errors.rePassword?.message}
            />
          )}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <DateField
                label="Date of birth"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value ? toIsoDateOnly(field.value) : ""}
                onChange={(event) => field.onChange(parseDateInput(event.target.value) ?? undefined)}
                max={latestDateForMinimumAge(12)}
                error={errors.dateOfBirth?.message}
              />
            )}
          />
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <RadioPills
                label="Gender"
                name={field.name}
                ref={field.ref}
                value={field.value}
                options={GENDER_OPTIONS}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.gender?.message}
              />
            )}
          />
        </div>
        <Button type="submit" size="lg" fullWidth loading={isSubmitting} success={joined} disabled={joined} className="mt-1">
          {joined ? "You’re in" : "Join Aura"}
        </Button>
      </form>
    </AuthFrame>
  );
}
```

- [ ] **Step 5: Delete the old tabs, then verify**

```bash
git rm src/features/auth/components/AuthTabs.tsx
npm run typecheck
npx eslint src/pages/LoginPage.tsx src/pages/RegisterPage.tsx src/features/auth
```

Browser, as a guest, at `/auth/login` and `/auth/register`:
- The poster fits on one line at 375, 768 and 1280, and the art is visible only from 1024.
- Submitting empty forms shows field errors and a shake.
- Typing a username re-slaps the sticker, and its colour becomes the field's focus ring.
- The password rules tick off as you type.
- Run `history.replaceState({usr:{handle:"mira"}}, "")` and reload: the username is pre-filled.
- Night theme: every surface is readable.

- [ ] **Step 6: Commit** — `git commit -m "Rebuild sign-in and register on the kit with a live identity sticker"`

---

### Task 3.2: PostCard, comments and the Post page

**Files:**
- Create in `src/features/posts/components/PostCard/`: `usePostCardActions.ts`, `PostHeader.tsx`, `PostBody.tsx`, `QuotedPost.tsx`, `PostActions.tsx`, `TopComment.tsx`, `PostEditForm.tsx`, `ShareSheet.tsx`
- Modify (replace): `src/features/posts/components/PostCard/index.tsx`
- Delete from `PostCard/`: `PostCardActions.tsx`, `PostCardEditForm.tsx`, `PostCardHeader.tsx`, `PostCardMenu.tsx`, `PostCardStats.tsx`, `SharedPostPreview.tsx`, `SharePostModal.tsx`, `TopCommentPreview.tsx`
- Create in `src/features/comments/components/`: `CommentRow.tsx`, `CommentItem.tsx`
- Modify (replace) in `src/features/comments/components/`: `CommentsSection.tsx`, `CommentComposer.tsx`, `CommentEditForm.tsx`, `ReplyList.tsx`
- Delete from `src/features/comments/components/`: `CommentThread.tsx`, `ReplyComposer.tsx`
- Modify (replace): `src/pages/PostDetailsPage.tsx`

**Interfaces:**
- `<PostCard post variant?="feed"|"detail" index? onComment? onDeleted? />`
  - `feed`: the card slaps in when it scrolls into view, the body opens the post, and the top comment is previewed.
  - `detail`: the card sits still, and `onComment` focuses the page's comment box.
- `<CommentsSection postId composerRef? autoFocus? />`
- Post images carry `view-transition-name: post-{id}`, so the image travels from the wall to the post page.

- [ ] **Step 1: Card actions**

**File:** `src/features/posts/components/PostCard/usePostCardActions.ts`

```ts
import { getErrorMessage } from "@/shared/api/errors";
import { useToast } from "@/shared/kit/toast/useToast";
import {
  useDeletePost,
  useSharePost,
  useTogglePostBookmark,
  useTogglePostLike,
  useUpdatePost,
} from "../../hooks/usePostMutations";
import { useCanManagePost } from "../../hooks/usePostPermissions";
import type { Post } from "../../model/post.types";

/**
 * Everything a post card can do, with the toasts that report it. Counts live
 * in the query cache and move optimistically (see usePostMutations), so the
 * card itself only remembers which panel is open.
 */
export function usePostCardActions(post: Post) {
  const toast = useToast();
  const canManage = useCanManagePost(post);
  const likeMutation = useTogglePostLike(post);
  const bookmarkMutation = useTogglePostBookmark(post);
  const shareMutation = useSharePost(post);
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  const fail = (error: unknown, fallback: string) =>
    toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(error, fallback) });

  return {
    canManage,
    isSharing: shareMutation.isPending,
    isSaving: updateMutation.isPending,
    isRemoving: deleteMutation.isPending,

    toggleLike() {
      if (likeMutation.isPending) return;
      likeMutation.mutate(undefined, { onError: (error) => fail(error, "Your like didn’t save. Try again.") });
    },

    toggleSave() {
      if (bookmarkMutation.isPending) return;
      const wasSaved = post.isBookmarked;
      bookmarkMutation.mutate(undefined, {
        onSuccess: () => toast.show({ title: wasSaved ? "Removed from Saved." : "Saved. Find it under Saved." }),
        onError: (error) => fail(error, "Your saved posts didn’t update. Try again."),
      });
    },

    share(caption: string, onDone: () => void) {
      if (shareMutation.isPending) return;
      shareMutation.mutate(caption, {
        onSuccess: () => {
          onDone();
          toast.show({ tone: "success", title: "Shared to your wall." });
        },
        onError: (error) => fail(error, "The share didn’t go through. Try again."),
      });
    },

    edit(body: string, onDone: () => void) {
      updateMutation.mutate(
        { postId: post.id, body, imageFile: null },
        {
          onSuccess: () => {
            onDone();
            toast.show({ title: "Post updated." });
          },
          onError: (error) => fail(error, "Your changes didn’t save. Try again."),
        },
      );
    },

    remove(onDone: () => void) {
      if (deleteMutation.isPending) return;
      deleteMutation.mutate(post.id, {
        onSuccess: () => {
          onDone();
          toast.show({ title: "Post deleted." });
        },
        onError: (error) => fail(error, "The post is still there. Try again."),
      });
    },
  };
}
```

- [ ] **Step 2: Card parts**

**File:** `src/features/posts/components/PostCard/PostHeader.tsx`

```tsx
import { Link } from "react-router";
import { formatDateTime, formatRelativeShort } from "@/shared/lib/dates";
import { Avatar } from "@/shared/kit/Avatar";
import { Menu, type MenuItem } from "@/shared/kit/Menu";
import { routes } from "@/app/router/routes";
import type { Post } from "../../model/post.types";

/** Who posted it and when; the owner's menu on the right. */
export function PostHeader({ post, menu }: { post: Post; menu: MenuItem[] }) {
  const { author } = post;
  const profileHref = author.id ? routes.userProfile(author.id) : routes.profile;

  return (
    <header className="flex items-center gap-3">
      <Link to={profileHref} viewTransition tabIndex={-1} aria-hidden className="shrink-0 rounded-full">
        <Avatar identityKey={author.handle} name={author.name} photo={author.photo} />
      </Link>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <Link
          to={profileHref}
          viewTransition
          className="justify-self-start truncate text-[16px] leading-tight font-bold hover:underline hover:decoration-1 hover:underline-offset-4"
        >
          {author.name}
        </Link>
        <p className="flex min-w-0 items-center gap-1.5 type-caption text-ink-2">
          <span className="truncate">{author.handle}</span>
          <span aria-hidden>·</span>
          <Link
            to={routes.postDetails(post.id)}
            viewTransition
            aria-label={`Open post, posted ${formatDateTime(post.createdAt)}`}
            className="shrink-0 tnum hover:underline hover:underline-offset-4"
          >
            <time dateTime={post.createdAt ?? undefined}>{formatRelativeShort(post.createdAt)}</time>
          </Link>
        </p>
      </div>
      {menu.length > 0 ? <Menu label="Post options" items={menu} /> : null}
    </header>
  );
}
```

**File:** `src/features/posts/components/PostCard/PostBody.tsx`

```tsx
import type { MouseEvent } from "react";
import { cx } from "@/shared/kit/cx";
import type { Post } from "../../model/post.types";

interface PostBodyProps {
  post: Post;
  variant: "feed" | "detail";
  /** Feed cards open the post when the words or the picture are clicked. */
  onOpen?: () => void;
}

/** The words, then the picture. A short post with nothing else is set large — the words are the whole post. */
export function PostBody({ post, variant, onOpen }: PostBodyProps) {
  // A share that carries the original's image shows it once, in the quote.
  const image = post.image && post.image !== post.sharedPost?.image ? post.image : null;
  if (!post.body && !image) return null;

  const isShout = !image && !post.sharedPost && post.body.length <= 140;

  const open = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    // Portalled dialogs bubble through React too; ignore anything outside this
    // block, anything interactive, and clicks that finish a text selection.
    if (!event.currentTarget.contains(target) || target.closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    onOpen?.();
  };

  return (
    <div onClick={onOpen ? open : undefined} className={cx("grid gap-4", onOpen && "cursor-pointer")}>
      {post.body ? (
        <p
          className={cx(
            "break-words whitespace-pre-wrap",
            isShout ? "type-heading-sm" : "type-body-lg",
            variant === "feed" && "line-clamp-[14]",
          )}
        >
          {post.body}
        </p>
      ) : null}
      {image ? (
        <div className="overflow-hidden rounded-chip border border-line bg-surface-2">
          <img
            src={image}
            alt=""
            loading={variant === "detail" ? "eager" : "lazy"}
            decoding="async"
            className={cx("block w-full object-cover", variant === "feed" && "max-h-[560px]")}
            style={{ viewTransitionName: `post-${post.id}` }}
          />
        </div>
      ) : null}
    </div>
  );
}
```

**File:** `src/features/posts/components/PostCard/QuotedPost.tsx`

```tsx
import { Link } from "react-router";
import { formatDateTime, formatRelativeShort } from "@/shared/lib/dates";
import { Avatar } from "@/shared/kit/Avatar";
import { routes } from "@/app/router/routes";
import type { Post } from "../../model/post.types";

/** The original post inside a share: a smaller sticker stuck inside the bigger one. */
export function QuotedPost({ post }: { post: Post }) {
  const { author } = post;

  return (
    <div role="group" aria-label={`Shared from ${author.name}`} className="grid gap-3 rounded-chip border border-line bg-ground p-4">
      <div className="flex items-center gap-2.5">
        <Avatar identityKey={author.handle} name={author.name} photo={author.photo} size="sm" />
        <p className="min-w-0 flex-1 truncate type-caption text-ink-2">
          <span className="text-[15px] font-bold text-ink">{author.name}</span> {author.handle}
        </p>
        <time
          dateTime={post.createdAt ?? undefined}
          title={formatDateTime(post.createdAt)}
          className="shrink-0 type-caption text-ink-2 tnum"
        >
          {formatRelativeShort(post.createdAt)}
        </time>
      </div>
      {post.body ? <p className="line-clamp-6 break-words whitespace-pre-wrap type-body">{post.body}</p> : null}
      {post.image ? (
        <img
          src={post.image}
          alt=""
          loading="lazy"
          decoding="async"
          className="block max-h-[360px] w-full rounded-chip border border-line object-cover"
        />
      ) : null}
      <Link
        to={routes.postDetails(post.id)}
        viewTransition
        className="justify-self-start type-label underline decoration-1 underline-offset-4"
      >
        Open original
      </Link>
    </div>
  );
}
```

**File:** `src/features/posts/components/PostCard/PostActions.tsx`

```tsx
import { CommentButton, LikeButton, SaveButton, ShareButton } from "@/shared/kit/ActionButtons";
import type { Post } from "../../model/post.types";

interface PostActionsProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}

/** Like, comment and share on the left; save on its own at the right. */
export function PostActions({ post, onLike, onComment, onShare, onSave }: PostActionsProps) {
  return (
    <div className="-mx-2.5 -mb-1.5 flex items-center gap-1">
      <LikeButton liked={post.isLiked} count={post.likesCount} onToggle={onLike} />
      <CommentButton count={post.commentsCount} onClick={onComment} />
      <ShareButton count={post.sharesCount} onClick={onShare} />
      <div className="ml-auto">
        <SaveButton saved={post.isBookmarked} onToggle={onSave} label="Save post" />
      </div>
    </div>
  );
}
```

**File:** `src/features/posts/components/PostCard/TopComment.tsx`

```tsx
import { Link } from "react-router";
import { Avatar } from "@/shared/kit/Avatar";
import { formatCount } from "@/shared/kit/format";
import { routes } from "@/app/router/routes";
import type { PostTopComment } from "../../model/post.types";

/** The comment worth reading first, under a post on the wall. */
export function TopComment({ postId, comment, total }: { postId: string; comment: PostTopComment; total: number }) {
  return (
    <div className="flex items-start gap-3 rounded-chip bg-surface-2 p-3.5">
      <Avatar identityKey={comment.authorName} name={comment.authorName} photo={comment.authorPhoto} size="sm" frame={false} />
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="line-clamp-3 break-words type-body">
          <span className="font-bold">{comment.authorName}</span> <span className="text-ink-2">{comment.content}</span>
        </p>
        <Link
          to={`${routes.postDetails(postId)}?showComments=1`}
          viewTransition
          className="justify-self-start type-caption font-bold underline decoration-1 underline-offset-4"
        >
          {total > 1 ? `See all ${formatCount(total)} comments` : "Reply"}
        </Link>
      </div>
    </div>
  );
}
```

**File:** `src/features/posts/components/PostCard/PostEditForm.tsx`

```tsx
import { useState } from "react";
import { MAX_POST_BODY_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { TextArea } from "@/shared/kit/TextArea";

interface PostEditFormProps {
  initialBody: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (body: string) => void;
}

/** Edits the words in place; the image stays as it is. */
export function PostEditForm({ initialBody, saving, onCancel, onSave }: PostEditFormProps) {
  const [body, setBody] = useState(initialBody);

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (body.trim()) onSave(body);
      }}
    >
      <TextArea
        label="Edit post"
        hideLabel
        autoFocus
        value={body}
        readOnly={saving}
        maxLength={MAX_POST_BODY_LENGTH}
        counter="near"
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving} disabled={!body.trim()}>
          Save
        </Button>
      </div>
    </form>
  );
}
```

**File:** `src/features/posts/components/PostCard/ShareSheet.tsx`

```tsx
import { useState } from "react";
import { MAX_SHARE_CAPTION_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { Modal } from "@/shared/kit/Modal";
import { TextArea } from "@/shared/kit/TextArea";
import type { Post } from "../../model/post.types";
import { QuotedPost } from "./QuotedPost";

interface ShareSheetProps {
  open: boolean;
  /** Shown in the preview — the original when re-sharing a share. */
  post: Post;
  sharing: boolean;
  onClose: () => void;
  onShare: (caption: string) => void;
}

/** Share to your own wall, with an optional line on top. */
export function ShareSheet({ open, post, sharing, onClose, onShare }: ShareSheetProps) {
  const [caption, setCaption] = useState("");
  const [wasOpen, setWasOpen] = useState(open);

  // Every opening starts with an empty caption.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setCaption("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share to your wall"
      description="Add a line, or share it as it is."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={sharing}>
            Cancel
          </Button>
          <Button iconStart="send" loading={sharing} onClick={() => onShare(caption)}>
            Share
          </Button>
        </>
      }
    >
      <div className="grid gap-5">
        <TextArea
          label="Caption"
          hideLabel
          autoFocus
          placeholder="Why is it worth a look?"
          value={caption}
          readOnly={sharing}
          maxLength={MAX_SHARE_CAPTION_LENGTH}
          counter="near"
          onChange={(event) => setCaption(event.target.value)}
        />
        <QuotedPost post={post} />
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: The card**

**File:** `src/features/posts/components/PostCard/index.tsx`

```tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ConfirmDialog } from "@/shared/kit/ConfirmDialog";
import type { MenuItem } from "@/shared/kit/Menu";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import type { Post } from "../../model/post.types";
import { PostActions } from "./PostActions";
import { PostBody } from "./PostBody";
import { PostEditForm } from "./PostEditForm";
import { PostHeader } from "./PostHeader";
import { QuotedPost } from "./QuotedPost";
import { ShareSheet } from "./ShareSheet";
import { TopComment } from "./TopComment";
import { usePostCardActions } from "./usePostCardActions";

interface PostCardProps {
  post: Post;
  /** `feed` cards open the post page and preview the top comment; `detail` is the post on its own page. */
  variant?: "feed" | "detail";
  /** Position in a list: staggers the first screenful and alternates the arrival tilt. */
  index?: number;
  /** The post page focuses its own comment box instead of navigating. */
  onComment?: () => void;
  /** The post page leaves once its post is deleted. */
  onDeleted?: () => void;
}

/** One post, stuck to the wall — on a feed it slaps on from a tilt as it scrolls into view. */
export function PostCard({ post, variant = "feed", index = 0, onComment, onDeleted }: PostCardProps) {
  const navigate = useNavigate();
  const { reduced } = useMotionPrefs();
  const actions = usePostCardActions(post);
  const [isEditing, setIsEditing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isFeed = variant === "feed";
  const arrives = isFeed && !reduced;
  const tilt = index % 2 === 0 ? -7 : 6;
  const openPost = (query = "") => navigate(`${routes.postDetails(post.id)}${query}`, { viewTransition: true });

  const menu: MenuItem[] =
    actions.canManage && !isEditing
      ? [
          { label: "Edit post", glyph: "edit", onSelect: () => setIsEditing(true) },
          { label: "Delete post", glyph: "trash", tone: "danger", onSelect: () => setIsDeleting(true) },
        ]
      : [];

  return (
    <motion.article
      aria-label={`Post by ${post.author.name}`}
      className="grid gap-4 rounded-card border border-line bg-surface p-5 sm:p-6"
      initial={arrives ? { opacity: 0, y: -18, rotate: tilt, scale: 1.06 } : false}
      whileInView={arrives ? { opacity: 1, y: 0, rotate: 0, scale: 1 } : undefined}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ ...spring.arrive, delay: index < 4 ? index * 0.07 : 0 }}
    >
      <PostHeader post={post} menu={menu} />

      {isEditing ? (
        <PostEditForm
          initialBody={post.body}
          saving={actions.isSaving}
          onCancel={() => setIsEditing(false)}
          onSave={(body) => actions.edit(body, () => setIsEditing(false))}
        />
      ) : (
        <PostBody post={post} variant={variant} onOpen={isFeed ? () => openPost() : undefined} />
      )}

      {post.sharedPost ? <QuotedPost post={post.sharedPost} /> : null}

      <PostActions
        post={post}
        onLike={actions.toggleLike}
        onComment={onComment ?? (() => openPost("?showComments=1"))}
        onShare={() => setIsSharing(true)}
        onSave={actions.toggleSave}
      />

      {isFeed && post.topComment ? <TopComment postId={post.id} comment={post.topComment} total={post.commentsCount} /> : null}

      <ShareSheet
        open={isSharing}
        post={post.sharedPost ?? post}
        sharing={actions.isSharing}
        onClose={() => {
          if (!actions.isSharing) setIsSharing(false);
        }}
        onShare={(caption) => actions.share(caption, () => setIsSharing(false))}
      />
      <ConfirmDialog
        open={isDeleting}
        onClose={() => {
          if (!actions.isRemoving) setIsDeleting(false);
        }}
        onConfirm={() =>
          actions.remove(() => {
            setIsDeleting(false);
            onDeleted?.();
          })
        }
        title="Delete this post?"
        description="It comes off every wall, for good."
        confirmLabel="Delete post"
        destructive
        loading={actions.isRemoving}
      />
    </motion.article>
  );
}
```

- [ ] **Step 4: Comments**

**File:** `src/features/comments/components/CommentRow.tsx`

```tsx
import type { ReactNode } from "react";
import { Link } from "react-router";
import { formatCommentTime, formatDateTime } from "@/shared/lib/dates";
import { Avatar } from "@/shared/kit/Avatar";
import { cx } from "@/shared/kit/cx";
import { Menu, type MenuItem } from "@/shared/kit/Menu";
import { routes } from "@/app/router/routes";
import type { Comment } from "../model/comment.types";

interface CommentRowProps {
  comment: Comment;
  /** Owner actions behind a "more" button. */
  menu?: MenuItem[];
  /** The words (or their editor), then the actions and any thread. */
  children: ReactNode;
}

/** Who said it and when, beside what they said. A comment still sending is dimmed and says so. */
export function CommentRow({ comment, menu = [], children }: CommentRowProps) {
  const nameClass = "text-[15px] font-bold text-ink";

  return (
    <div className={cx("flex items-start gap-3", comment.isOptimistic && "opacity-60")}>
      <Avatar
        identityKey={comment.authorHandle || comment.authorName}
        name={comment.authorName}
        photo={comment.authorPhoto}
        size="sm"
        className="mt-0.5"
      />
      <div className="grid min-w-0 flex-1 gap-1.5">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 type-caption text-ink-2">
            {comment.authorId ? (
              <Link
                to={routes.userProfile(comment.authorId)}
                viewTransition
                className={cx(nameClass, "hover:underline hover:decoration-1 hover:underline-offset-4")}
              >
                {comment.authorName}
              </Link>
            ) : (
              <span className={nameClass}>{comment.authorName}</span>
            )}{" "}
            {comment.authorHandle} <span aria-hidden>·</span>{" "}
            {comment.isOptimistic ? (
              <span>Sending…</span>
            ) : (
              <time dateTime={comment.createdAt ?? undefined} title={formatDateTime(comment.createdAt)} className="tnum">
                {formatCommentTime(comment.createdAt)}
              </time>
            )}
          </p>
          {menu.length > 0 ? <Menu label="Comment options" items={menu} className="-mt-1.5" /> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
```

**File:** `src/features/comments/components/CommentComposer.tsx`

```tsx
import { useState, type FormEvent, type ReactNode, type Ref } from "react";
import { MAX_COMMENT_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { TextArea } from "@/shared/kit/TextArea";

interface CommentComposerProps {
  label: string;
  placeholder: string;
  submitLabel: string;
  pending: boolean;
  /** Resolves `true` once the text is accepted — only then does the box empty. */
  onSubmit: (content: string) => Promise<boolean>;
  onCancel?: () => void;
  autoFocus?: boolean;
  /** Shown before the box: the writer's avatar. */
  lead?: ReactNode;
  ref?: Ref<HTMLTextAreaElement>;
}

/** A comment or reply box. Ctrl/⌘ + Enter sends. */
export function CommentComposer({ label, placeholder, submitLabel, pending, onSubmit, onCancel, autoFocus, lead, ref }: CommentComposerProps) {
  const [content, setContent] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || pending) return;
    if (await onSubmit(trimmed)) setContent("");
  };

  return (
    <form aria-label={label} onSubmit={(event) => void submit(event)} className="flex items-start gap-3">
      {lead}
      <div className="grid min-w-0 flex-1 gap-2">
        <TextArea
          ref={ref}
          label={label}
          hideLabel
          rows={1}
          placeholder={placeholder}
          value={content}
          readOnly={pending}
          autoFocus={autoFocus}
          maxLength={MAX_COMMENT_LENGTH}
          counter="near"
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" size="sm" iconStart="send" loading={pending} disabled={!content.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
```

**File:** `src/features/comments/components/CommentEditForm.tsx`

```tsx
import { useState } from "react";
import { MAX_COMMENT_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { TextArea } from "@/shared/kit/TextArea";

interface CommentEditFormProps {
  initialContent: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (content: string) => void;
}

export function CommentEditForm({ initialContent, saving, onCancel, onSave }: CommentEditFormProps) {
  const [content, setContent] = useState(initialContent);

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (content.trim()) onSave(content.trim());
      }}
    >
      <TextArea
        label="Edit comment"
        hideLabel
        rows={1}
        autoFocus
        value={content}
        readOnly={saving}
        maxLength={MAX_COMMENT_LENGTH}
        counter="near"
        onChange={(event) => setContent(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving} disabled={!content.trim()}>
          Save
        </Button>
      </div>
    </form>
  );
}
```

**File:** `src/features/comments/components/ReplyList.tsx`

```tsx
import { getErrorMessage } from "@/shared/api/errors";
import { queryKeys } from "@/shared/api/queryKeys";
import { LikeButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { ErrorState } from "@/shared/kit/ErrorState";
import { ListSkeleton } from "@/shared/kit/Skeleton";
import { useToast } from "@/shared/kit/toast/useToast";
import { useToggleCommentLike } from "../hooks/useCommentMutations";
import type { Comment } from "../model/comment.types";
import { CommentRow } from "./CommentRow";

function ReplyItem({ postId, parentId, reply }: { postId: string; parentId: string; reply: Comment }) {
  const toast = useToast();
  const like = useToggleCommentLike(postId, reply, queryKeys.comments.replies(postId, parentId));

  return (
    <CommentRow comment={reply}>
      {reply.content ? <p className="break-words whitespace-pre-wrap type-body">{reply.content}</p> : null}
      <div className="-ml-2.5">
        <LikeButton
          size="sm"
          label="Like reply"
          liked={reply.isLiked}
          count={reply.likesCount}
          disabled={reply.isOptimistic}
          onToggle={() => {
            if (like.isPending) return;
            like.mutate(undefined, {
              onError: (error) =>
                toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(error, "Your like didn’t save. Try again.") }),
            });
          }}
        />
      </div>
    </CommentRow>
  );
}

interface ReplyListProps {
  postId: string;
  parentId: string;
  replies: Comment[];
  isLoading: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

/** Replies hang one step in, behind a rule. */
export function ReplyList({ postId, parentId, replies, isLoading, error, hasNextPage, isFetchingNextPage, onLoadMore, onRetry }: ReplyListProps) {
  const isReady = !isLoading && !error;

  return (
    <div className="mt-1 grid gap-4 border-l border-line pl-4">
      {isLoading ? <ListSkeleton rows={1} label="Loading replies" /> : null}
      {!isLoading && error ? (
        <ErrorState level="inline" message={getErrorMessage(error, "The replies didn’t load.")} onRetry={onRetry} />
      ) : null}
      {isReady && replies.length === 0 ? <p className="type-caption text-ink-2">No replies yet.</p> : null}
      {isReady ? replies.map((reply) => <ReplyItem key={reply.id} postId={postId} parentId={parentId} reply={reply} />) : null}
      {isReady && hasNextPage ? (
        <Button variant="ghost" size="sm" className="justify-self-start" loading={isFetchingNextPage} onClick={onLoadMore}>
          More replies
        </Button>
      ) : null}
    </div>
  );
}
```

**File:** `src/features/comments/components/CommentItem.tsx`

```tsx
import { useMemo, useState } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { queryKeys } from "@/shared/api/queryKeys";
import { isSameEntity } from "@/shared/lib/values";
import { LikeButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { ConfirmDialog } from "@/shared/kit/ConfirmDialog";
import type { MenuItem } from "@/shared/kit/Menu";
import { useToast } from "@/shared/kit/toast/useToast";
import { useCreateComment, useDeleteComment, useToggleCommentLike, useUpdateComment } from "../hooks/useCommentMutations";
import { useReplies } from "../hooks/useCommentQueries";
import { flattenComments, readTotalCount } from "../model/comment.cache";
import type { Comment } from "../model/comment.types";
import { CommentComposer } from "./CommentComposer";
import { CommentEditForm } from "./CommentEditForm";
import { CommentRow } from "./CommentRow";
import { ReplyList } from "./ReplyList";

interface CommentItemProps {
  postId: string;
  comment: Comment;
  meId: string | null;
  meName: string;
}

/**
 * One comment with its like, its replies and its owner's actions. Replies
 * load only once the thread is opened, so a page of comments doesn't fire a
 * request for each.
 */
export function CommentItem({ postId, comment, meId, meName }: CommentItemProps) {
  const toast = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const like = useToggleCommentLike(postId, comment, queryKeys.comments.list(postId));
  const update = useUpdateComment(postId, comment.id);
  const remove = useDeleteComment(postId, comment.id);
  const reply = useCreateComment(postId, "reply", comment.id, meName);

  const repliesQuery = useReplies(postId, comment.id, showReplies);
  const replies = useMemo(() => flattenComments(repliesQuery.data), [repliesQuery.data]);
  const repliesCount = readTotalCount(repliesQuery.data, comment.repliesCount || replies.length);

  const fail = (error: unknown, fallback: string) =>
    toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(error, fallback) });

  const menu: MenuItem[] =
    isSameEntity(comment.authorId, meId) && !comment.isOptimistic && !isEditing
      ? [
          { label: "Edit comment", glyph: "edit", onSelect: () => setIsEditing(true) },
          { label: "Delete comment", glyph: "trash", tone: "danger", onSelect: () => setIsDeleting(true) },
        ]
      : [];

  const sendReply = async (content: string) => {
    setShowReplies(true);
    try {
      await reply.mutateAsync(content);
      setIsReplying(false);
      return true;
    } catch (error) {
      fail(error, "Your reply didn’t post. Try again.");
      return false;
    }
  };

  // mutateAsync for the edit and the delete: the optimistic cache update can
  // unmount this comment before the request settles, and a failure must still
  // be reported.
  const saveEdit = async (content: string) => {
    try {
      await update.mutateAsync(content);
      setIsEditing(false);
    } catch (error) {
      fail(error, "Your edit didn’t save. Try again.");
    }
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync();
      setIsDeleting(false);
    } catch (error) {
      fail(error, "The comment is still there. Try again.");
    }
  };

  return (
    <CommentRow comment={comment} menu={menu}>
      {isEditing ? (
        <CommentEditForm
          initialContent={comment.content}
          saving={update.isPending}
          onCancel={() => setIsEditing(false)}
          onSave={(content) => void saveEdit(content)}
        />
      ) : comment.content ? (
        <p className="break-words whitespace-pre-wrap type-body">{comment.content}</p>
      ) : null}

      <div className="-ml-2.5 flex flex-wrap items-center gap-1">
        <LikeButton
          size="sm"
          label="Like comment"
          liked={comment.isLiked}
          count={comment.likesCount}
          disabled={comment.isOptimistic}
          onToggle={() => {
            if (like.isPending) return;
            like.mutate(undefined, { onError: (error) => fail(error, "Your like didn’t save. Try again.") });
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={comment.isOptimistic}
          aria-expanded={isReplying}
          onClick={() => setIsReplying((open) => !open)}
        >
          Reply
        </Button>
        {repliesCount > 0 || showReplies ? (
          <Button variant="ghost" size="sm" aria-expanded={showReplies} onClick={() => setShowReplies((open) => !open)}>
            {showReplies ? "Hide replies" : `${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`}
          </Button>
        ) : null}
      </div>

      {isReplying ? (
        <CommentComposer
          label="Write a reply"
          placeholder={`Reply to ${comment.authorName}`}
          submitLabel="Reply"
          autoFocus
          pending={reply.isPending}
          onSubmit={sendReply}
          onCancel={() => setIsReplying(false)}
        />
      ) : null}

      {showReplies ? (
        <ReplyList
          postId={postId}
          parentId={comment.id}
          replies={replies}
          isLoading={repliesQuery.isLoading}
          error={repliesQuery.error}
          hasNextPage={repliesQuery.hasNextPage}
          isFetchingNextPage={repliesQuery.isFetchingNextPage}
          onLoadMore={() => void repliesQuery.fetchNextPage()}
          onRetry={() => void repliesQuery.refetch()}
        />
      ) : null}

      <ConfirmDialog
        open={isDeleting}
        onClose={() => {
          if (!remove.isPending) setIsDeleting(false);
        }}
        onConfirm={() => void confirmDelete()}
        title="Delete this comment?"
        description="It disappears for everyone."
        confirmLabel="Delete comment"
        destructive
        loading={remove.isPending}
      />
    </CommentRow>
  );
}
```

**File:** `src/features/comments/components/CommentsSection.tsx`

```tsx
import { useMemo, useState, type Ref } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { Avatar } from "@/shared/kit/Avatar";
import { Button } from "@/shared/kit/Button";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { Segmented } from "@/shared/kit/Segmented";
import { ListSkeleton } from "@/shared/kit/Skeleton";
import { useToast } from "@/shared/kit/toast/useToast";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { useCreateComment } from "../hooks/useCommentMutations";
import { useComments } from "../hooks/useCommentQueries";
import { flattenComments, readTotalCount } from "../model/comment.cache";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";

type SortOrder = "top" | "newest";

const SORT_OPTIONS = [
  { value: "top" as const, label: "Top" },
  { value: "newest" as const, label: "Newest" },
];

interface CommentsSectionProps {
  postId: string;
  /** The post page focuses this box when its comment button is pressed. */
  composerRef?: Ref<HTMLTextAreaElement>;
  autoFocus?: boolean;
}

/** The conversation under a post: a box to write in, then every comment and its thread. */
export function CommentsSection({ postId, composerRef, autoFocus }: CommentsSectionProps) {
  const { data: me } = useCurrentUser();
  const toast = useToast();
  const [sort, setSort] = useState<SortOrder>("top");

  const commentsQuery = useComments(postId);
  const create = useCreateComment(postId, "comment", null, me?.name ?? "You");

  const comments = useMemo(() => flattenComments(commentsQuery.data), [commentsQuery.data]);
  const sorted = useMemo(() => {
    if (sort !== "newest") return comments;
    return [...comments].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [comments, sort]);

  const total = readTotalCount(commentsQuery.data, sorted.length);
  const isReady = !commentsQuery.isLoading && !commentsQuery.error;

  const send = async (content: string) => {
    try {
      await create.mutateAsync(content);
      return true;
    } catch (error) {
      toast.show({ tone: "error", title: "Your comment didn’t post", description: getErrorMessage(error, "Try sending it again.") });
      return false;
    }
  };

  return (
    <section id="comments" aria-labelledby="comments-title" className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="comments-title" className="type-heading">
          Comments <span className="text-ink-3 tnum">{total}</span>
        </h2>
        {sorted.length > 1 ? <Segmented size="sm" label="Sort comments" options={SORT_OPTIONS} value={sort} onChange={setSort} /> : null}
      </div>

      <CommentComposer
        ref={composerRef}
        label="Write a comment"
        placeholder="Add to the conversation"
        submitLabel="Comment"
        autoFocus={autoFocus}
        pending={create.isPending}
        onSubmit={send}
        lead={<Avatar identityKey={me?.handle ?? "you"} name={me?.name ?? "You"} photo={me?.photo} size="sm" className="mt-1.5" />}
      />

      {commentsQuery.isLoading ? <ListSkeleton rows={3} label="Loading comments" /> : null}
      {!commentsQuery.isLoading && commentsQuery.error ? (
        <ErrorState
          message={getErrorMessage(commentsQuery.error, "The comments didn’t load. Check your connection and try again.")}
          onRetry={() => void commentsQuery.refetch()}
        />
      ) : null}
      {isReady && sorted.length === 0 ? (
        <EmptyState compact titleAs="h3" object="bubble-deflated" title="No comments yet." body="Say the first thing." />
      ) : null}
      {isReady && sorted.length > 0 ? (
        <ol className="grid gap-6">
          {sorted.map((comment) => (
            <li key={comment.id}>
              <CommentItem postId={postId} comment={comment} meId={me?.id ?? null} meName={me?.name ?? "You"} />
            </li>
          ))}
        </ol>
      ) : null}
      {isReady && commentsQuery.hasNextPage ? (
        <Button
          variant="secondary"
          className="justify-self-center"
          loading={commentsQuery.isFetchingNextPage}
          onClick={() => void commentsQuery.fetchNextPage()}
        >
          More comments
        </Button>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 5: The Post page**

**File:** `src/pages/PostDetailsPage.tsx`

```tsx
import { useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { getErrorMessage } from "@/shared/api/errors";
import { Button } from "@/shared/kit/Button";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { PostSkeleton } from "@/shared/kit/Skeleton";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { PostCard } from "@/features/posts/components/PostCard";
import { usePost } from "@/features/posts/hooks/usePostsQueries";

/** One post and its whole conversation. Its image arrives from the wall as a shared element. */
export default function PostDetailsPage() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { reduced } = useMotionPrefs();
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const { data: post, isLoading, error, refetch } = usePost(postId);

  // "default" is the key of the first entry in this tab — nothing to go back to.
  const back = () => (location.key === "default" ? navigate(routes.home, { viewTransition: true }) : navigate(-1));

  const focusComposer = () => {
    const box = composerRef.current;
    if (!box) return;
    box.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  };

  return (
    <div className="mx-auto grid max-w-(--reading) gap-8 pt-6 sm:pt-10">
      <Button variant="ghost" size="sm" iconStart="arrow-left" onClick={back} className="-ml-3.5 justify-self-start">
        Back
      </Button>

      {isLoading ? <PostSkeleton /> : null}

      {!isLoading && error ? (
        <ErrorState
          title="This post didn’t load"
          message={getErrorMessage(error, "Check your connection and try again.")}
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isLoading && !error && !post ? (
        <EmptyState
          object="bubble-popped"
          title="This post popped."
          body="It may have been deleted, or the link is wrong."
          action={{ label: "Back to the wall", to: routes.home }}
        />
      ) : null}

      {post ? (
        <>
          <h1 className="sr-only">Post by {post.author.name}</h1>
          <PostCard
            post={post}
            variant="detail"
            onComment={focusComposer}
            onDeleted={() => navigate(routes.home, { replace: true, viewTransition: true })}
          />
          <CommentsSection postId={post.id} composerRef={composerRef} autoFocus={searchParams.get("showComments") === "1"} />
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 6: Kit specimens, and keep arriving cards from widening the page**

Cards wait tilted and scaled until they scroll into view, and a transformed box still counts towards scrollable overflow. Without a clip, phones get sideways scroll (measured: 404px of scroll width at 375). Changes:
- `main` in `src/layouts/MainLayout.tsx` and in `src/pages/kit/KitPage.tsx` gets `overflow-x-clip`, with a comment on the one in MainLayout.
- `KitPage` renders `<PostsSection />` after `<ShellSection />`, so the card can be reviewed without a session.

**File:** `src/pages/kit/PostsSection.tsx`

```tsx
import { useState } from "react";
import { PostCard } from "@/features/posts/components/PostCard";
import type { Post } from "@/features/posts/model/post.types";
import { PersonCard, PersonCardSkeleton } from "@/features/users/components/PersonCard";
import type { DiscoveredUser } from "@/features/users/model/user.types";
import { KitBlock } from "./KitBlock";

const PEOPLE: DiscoveredUser[] = [
  { id: "kit-1", name: "Mira Sol", username: "mira.sol", photo: "", followersCount: 212, isFollowing: false },
  { id: "kit-2", name: "Idris Okafor", username: "idris.okafor", photo: "", followersCount: 1, isFollowing: true },
];

const HOUR = 60 * 60 * 1000;

function samplePost(id: string, overrides: Partial<Post>): Post {
  return {
    id,
    body: "",
    image: null,
    createdAt: new Date(Date.now() - 3 * HOUR).toISOString(),
    author: { id: null, name: "Mira Sol", handle: "@mira.sol", photo: "" },
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    isLiked: false,
    isBookmarked: false,
    ownerFlag: false,
    ownerId: null,
    sharedPost: null,
    topComment: null,
    raw: {},
    ...overrides,
  };
}

const SHOUT = samplePost("kit-shout", {
  body: "Stuck my first sticker on the wall today. It’s mint and it’s mine.",
  likesCount: 128,
  commentsCount: 14,
  sharesCount: 3,
  isLiked: true,
  topComment: { authorName: "Idris Okafor", authorPhoto: "", content: "Mint suits you. Mine came out ember, which feels about right." },
});

const PICTURE = samplePost("kit-picture", {
  author: { id: null, name: "Idris Okafor", handle: "@idris.okafor", photo: "" },
  body: "Poster proofs for Friday. The big one is going above the stairs, the small ones anywhere they stick.",
  image: "/og.png",
  likesCount: 1204,
  commentsCount: 87,
  sharesCount: 41,
  isBookmarked: true,
});

const SHARE = samplePost("kit-share", {
  author: { id: null, name: "Leila Haddad", handle: "@leila", photo: "" },
  body: "This is the energy for the week.",
  likesCount: 9,
  commentsCount: 1,
  sharedPost: SHOUT,
});

/** Sample post and person cards. The post buttons call the real API — look, don't press. */
export function PostsSection() {
  const [following, setFollowing] = useState<Record<string, boolean>>({});

  return (
    <div className="grid gap-16" id="posts">
      <h2 className="type-display">Posts & people</h2>
      <KitBlock title="Person card" note="Follow here only flips local state.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PEOPLE.map((person) => {
            const isFollowing = following[person.id] ?? person.isFollowing;
            return (
              <li key={person.id}>
                <PersonCard
                  user={person}
                  following={isFollowing}
                  followers={person.followersCount + (isFollowing === person.isFollowing ? 0 : isFollowing ? 1 : -1)}
                  pending={false}
                  onToggleFollow={() => setFollowing((current) => ({ ...current, [person.id]: !isFollowing }))}
                />
              </li>
            );
          })}
          <li>
            <PersonCardSkeleton />
          </li>
        </ul>
      </KitBlock>
      <KitBlock title="Post card" note="Sample data. The buttons talk to the real API, so leave them alone here.">
        <div className="grid max-w-(--reading) gap-5">
          <PostCard post={SHOUT} index={0} />
          <PostCard post={PICTURE} index={1} />
          <PostCard post={SHARE} index={2} />
        </div>
      </KitBlock>
    </div>
  );
}
```

- [ ] **Step 7: Delete the old parts, then verify**

```bash
git rm src/features/posts/components/PostCard/PostCardActions.tsx src/features/posts/components/PostCard/PostCardEditForm.tsx src/features/posts/components/PostCard/PostCardHeader.tsx src/features/posts/components/PostCard/PostCardMenu.tsx src/features/posts/components/PostCard/PostCardStats.tsx src/features/posts/components/PostCard/SharedPostPreview.tsx src/features/posts/components/PostCard/SharePostModal.tsx src/features/posts/components/PostCard/TopCommentPreview.tsx src/features/comments/components/CommentThread.tsx src/features/comments/components/ReplyComposer.tsx
npm run typecheck
npx eslint src/features/posts src/features/comments src/pages/PostDetailsPage.tsx
```

Browser, with a session the user started:
- Open a post from the wall. The image travels as a shared element.
- Like, save and share-sheet open and cancel all work.
- Comment → reply → like, with the user's go-ahead before anything is posted.
- A missing post id (`/post/000000000000000000000000`) shows "This post popped."

- [ ] **Step 8: Commit** — `git commit -m "Rebuild the post card, comments and the post page on the kit"`

---

### Task 3.3: The Wall

**Files:**
- Modify (replace): `src/features/posts/components/PostsFeed.tsx`
- Delete: `src/features/posts/components/PostsFilter.tsx`, `src/features/posts/components/PostForm/index.tsx`

**Interfaces:**
- `<PostsFeed />`, which `HomePage` already renders.
- Rooms map to the existing `PostsFilter` values: Everyone → `community` (the default), Following → `feed`, Yours → `my-posts`, Saved → `saved`.

- [ ] **Step 1: The wall**

**File:** `src/features/posts/components/PostsFeed.tsx`

```tsx
import { useState } from "react";
import type { ObjectName } from "@/assets/objects/manifest";
import { getErrorMessage } from "@/shared/api/errors";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import { Segmented, type SegmentOption } from "@/shared/kit/Segmented";
import { PostSkeleton } from "@/shared/kit/Skeleton";
import { routes } from "@/app/router/routes";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { useComposer } from "../composer/useComposer";
import { usePosts } from "../hooks/usePostsQueries";
import type { PostsFilter } from "../model/post.types";
import { PostCard } from "./PostCard";
import { PostComposer } from "./PostComposer";

const ROOMS: SegmentOption<PostsFilter>[] = [
  { value: "community", label: "Everyone" },
  { value: "feed", label: "Following" },
  { value: "my-posts", label: "Yours" },
  { value: "saved", label: "Saved" },
];

interface EmptyRoom {
  object: ObjectName;
  title: string;
  body: string;
  action?: "write" | "people";
}

/** Each empty room says what belongs in it and how to get something there. */
const EMPTY_ROOMS: Record<PostsFilter, EmptyRoom> = {
  community: { object: "bubble-deflated", title: "The wall’s quiet.", body: "Be the first thing stuck to it.", action: "write" },
  feed: { object: "bubble-deflated", title: "Nobody to follow yet.", body: "Follow people and their posts land here.", action: "people" },
  "my-posts": { object: "bubble-deflated", title: "You haven’t posted yet.", body: "Say something — words alone are plenty.", action: "write" },
  saved: { object: "bookmark-deflated", title: "Nothing saved yet.", body: "Tap the bookmark on any post to keep it here, just for you." },
};

/**
 * The wall: one column of posts, newest first. The rooms filter it; the
 * composer sits at its head.
 */
export function PostsFeed() {
  const { data: me } = useCurrentUser();
  const composer = useComposer();
  // Everyone is the room you land in: a new account follows nobody.
  const [room, setRoom] = useState<PostsFilter>("community");
  const { data: posts = [], isPending, error, refetch } = usePosts(room, me?.id ?? null);

  const empty = EMPTY_ROOMS[room];
  const roomLabel = ROOMS.find((option) => option.value === room)?.label ?? "";

  return (
    <div className="mx-auto grid max-w-(--reading) gap-6">
      <PosterHeader title="Wall" lede="What everyone’s sticking up today.">
        <Segmented label="Rooms" options={ROOMS} value={room} onChange={setRoom} className="justify-self-start" />
      </PosterHeader>

      <div className="rounded-card border border-line bg-surface p-5 sm:p-6">
        <PostComposer />
      </div>

      <section aria-label={`${roomLabel} posts`} aria-busy={isPending} className="grid gap-5">
        {isPending ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : error ? (
          <ErrorState
            title="The wall didn’t load"
            message={getErrorMessage(error, "Check your connection and try again.")}
            onRetry={() => void refetch()}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            object={empty.object}
            title={empty.title}
            body={empty.body}
            action={
              empty.action === "write"
                ? { label: "Write a post", onClick: composer.open }
                : empty.action === "people"
                  ? { label: "Find people", to: routes.people }
                  : undefined
            }
          />
        ) : (
          <>
            <ol className="grid gap-5">
              {posts.map((post, index) => (
                <li key={post.id}>
                  <PostCard post={post} index={index} />
                </li>
              ))}
            </ol>
            <p className="pt-6 text-center type-label text-ink-3">That’s the whole wall.</p>
          </>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Delete the old pieces, then verify**

```bash
git rm src/features/posts/components/PostsFilter.tsx src/features/posts/components/PostForm/index.tsx
npm run typecheck
npx eslint src/features/posts
```

Browser, with a session:
- `/` at 375 / 768 / 1280 / 1440 in Paper and Night.
- The four rooms switch, and the sticker slides between them.
- Skeletons show while loading, and the empty room shows the right object and action.
- Cards slap in as you scroll, and the top card's image opens the post.
- Reduced motion: cards appear in place.

- [ ] **Step 3: Commit** — `git commit -m "Rebuild the wall: poster, rooms, inline composer and sticker post cards"`
