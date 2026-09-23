# Aura Rebrand — Phase 3b: People, Alerts, Settings, Profile, 404 and cleanup · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the page rebuild (spec §9) and remove the Accession Card UI for good:
- **People**: a debounced search, and people as profile cards with the peel-follow button.
- **Alerts**: All and Unread tabs, mark one or mark all, and a marked-read pop.
- **Settings**: the Night paper switch, the password form with live rules, and sign out.
- **Profile**:
  - a cover band (theirs, or their identity colour stuck with their own shape);
  - the avatar in its identity frame;
  - the name as an `xl` poster, and the counts;
  - Follow, or Settings plus a menu;
  - Posts and Saved tabs;
  - the photo framer, the cover confirm, and the image viewer.
  Upload feedback moves to toasts.
- **404**: the popped bubble.
- **Cleanup**: delete `shared/ui/*`, the old feature components, `lib/aura.ts`, the legacy toast provider and `legacy.css`, then reset the Tailwind default palette so only Aura's colours exist.

**Architecture:**
- The same rules as Phase 3a: thin pages, feature components on the kit, and data hooks reused.
- Two small hook changes, both additive or presentational:
  - `useUserProfile` also returns `refetch`, for a retry button.
  - `useProfileImages` reports results through toasts instead of returning an alert object.
- One new shared hook: `useDebouncedValue`, for People search (spec §9: "debounced search").

**Spec:** §7, §8 (You opens the profile; Settings and Sign out live there), §9. **Depends on:** Phases 0–2 and Phase 3a.

## Global Constraints

- Phase 3a's constraints apply.
- Profile and People use the page width (`max-w-(--page-max)`, from the shell). Alerts and Settings use the 640px column, and so do the profile's tabs and posts.
- The identity frame appears wherever a handle is known. Alerts carry no handle, so their avatars have no frame.
- Verification:
  - `npm run typecheck`, and `npx eslint` on the changed paths. The last task runs `npm run lint` and `npm run build`.
  - Browser as a guest: `/nope` (404), and `/__kit` still renders.
  - Member pages need the user's own session. Follows and uploads write to the shared API, so ask before doing them.

---

### Task 3.4: People

**Files:**
- Create: `src/shared/hooks/useDebouncedValue.ts`, `src/features/users/components/PersonCard.tsx`
- Modify (replace): `src/pages/PeoplePage.tsx`
- Delete: `src/features/users/components/discovery/UserCard.tsx`, `src/features/users/components/discovery/UserDiscoveryPanel.tsx` (both unused since Phase 2)

- [ ] **Step 1: Debounce**

**File:** `src/shared/hooks/useDebouncedValue.ts`

```ts
import { useEffect, useState } from "react";

/** `value`, once it has stopped changing for `delay` milliseconds. */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return settled;
}
```

- [ ] **Step 2: Person card**

**File:** `src/features/users/components/PersonCard.tsx`

```tsx
import { Link } from "react-router";
import { FollowButton } from "@/shared/kit/ActionButtons";
import { Avatar } from "@/shared/kit/Avatar";
import { Card } from "@/shared/kit/Card";
import { Counter } from "@/shared/kit/Counter";
import { Skeleton } from "@/shared/kit/Skeleton";
import { routes } from "@/app/router/routes";
import type { DiscoveredUser } from "../model/user.types";

interface PersonCardProps {
  user: DiscoveredUser;
  following: boolean;
  followers: number;
  pending: boolean;
  onToggleFollow: () => void;
}

/** Someone worth following: their sticker, their name, one button. */
export function PersonCard({ user, following, followers, pending, onToggleFollow }: PersonCardProps) {
  const href = routes.userProfile(user.id);

  return (
    <Card variant="profile" className="h-full content-start">
      <Link to={href} viewTransition tabIndex={-1} aria-hidden className="rounded-full">
        <Avatar identityKey={user.username} name={user.name} photo={user.photo} size="lg" />
      </Link>
      <div className="grid w-full min-w-0 gap-0.5">
        <Link
          to={href}
          viewTransition
          className="truncate text-[17px] font-bold hover:underline hover:decoration-1 hover:underline-offset-4"
        >
          {user.name}
        </Link>
        <p className="truncate type-caption text-ink-2">@{user.username}</p>
      </div>
      <p className="type-caption text-ink-2">
        <Counter value={followers} className="font-bold text-ink" /> {followers === 1 ? "follower" : "followers"}
      </p>
      <FollowButton size="sm" name={user.name} following={following} pending={pending} onToggle={onToggleFollow} />
    </Card>
  );
}

/** The loading shape of a person card. */
export function PersonCardSkeleton() {
  return (
    <div aria-hidden className="grid justify-items-center gap-3 rounded-card border border-line bg-surface p-5 sm:p-6">
      <Skeleton shape="circle" className="h-16 w-16" />
      <Skeleton className="w-28" />
      <Skeleton className="w-20" />
      <Skeleton className="mt-1 w-28" style={{ height: 36 }} />
    </div>
  );
}
```

- [ ] **Step 3: The page**

**File:** `src/pages/PeoplePage.tsx`

```tsx
import { useState } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { Button } from "@/shared/kit/Button";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import { SearchField } from "@/shared/kit/SearchField";
import { useToast } from "@/shared/kit/toast/useToast";
import { PersonCard, PersonCardSkeleton } from "@/features/users/components/PersonCard";
import { useToggleFollow, type FollowOverride } from "@/features/users/hooks/useToggleFollow";
import { useUserDiscovery } from "@/features/users/hooks/useUserDiscovery";

const SEARCH_DELAY_MS = 300;
const GRID = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3";

/** Find someone: suggestions until you type, then results. */
export default function PeoplePage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const term = useDebouncedValue(search.trim(), SEARCH_DELAY_MS);
  const [followOverrides, setFollowOverrides] = useState<Record<string, FollowOverride>>({});

  const discovery = useUserDiscovery(term, true);
  const follow = useToggleFollow(followOverrides, setFollowOverrides);
  const { users, isPending, error, hasNextPage, isFetchingNextPage } = discovery;

  const isSearching = term.length > 0;
  const isSettling = search.trim() !== term;

  return (
    <div className="grid gap-8">
      <PosterHeader title="People" lede="Find someone worth following. Their posts land on your wall.">
        <SearchField
          label="Search people"
          hideLabel
          placeholder="Search by name or username"
          value={search}
          onValueChange={setSearch}
          loading={isSettling || (isSearching && isPending)}
          className="w-full max-w-(--reading)"
        />
      </PosterHeader>

      <section aria-labelledby="people-heading" aria-busy={isPending} className="grid gap-5">
        <h2 id="people-heading" className="type-label text-ink-2">
          {isSearching ? `Results for “${term}”` : "People to follow"}
        </h2>

        {isPending ? (
          <div role="status" aria-label="Loading people" className={GRID}>
            {Array.from({ length: 6 }, (_, index) => (
              <PersonCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="People didn’t load"
            message={getErrorMessage(error, "Check your connection and try again.")}
            onRetry={() => void discovery.refetch()}
          />
        ) : users.length === 0 ? (
          <EmptyState
            object="bubble-deflated"
            title={isSearching ? "No one by that name." : "No one here yet."}
            body={isSearching ? "Try a first name, or the start of a username." : "When people join, they show up here."}
            action={isSearching ? { label: "Clear search", onClick: () => setSearch("") } : undefined}
          />
        ) : (
          <ul className={GRID}>
            {users.map((user) => {
              const state = follow.resolve(user.id, user.isFollowing, user.followersCount);
              return (
                <li key={user.id}>
                  <PersonCard
                    user={user}
                    following={state.isFollowing}
                    followers={state.followersCount}
                    pending={follow.pendingUserId === user.id}
                    onToggleFollow={() =>
                      follow.toggle(
                        { userId: user.id, currentIsFollowing: state.isFollowing, currentFollowersCount: state.followersCount },
                        {
                          onError: (failure) =>
                            toast.show({
                              tone: "error",
                              title: "That didn’t stick",
                              description: getErrorMessage(failure, `Your follow for ${user.name} didn’t save.`),
                            }),
                        },
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        )}

        {!isPending && !error && hasNextPage ? (
          <Button variant="secondary" className="justify-self-center" loading={isFetchingNextPage} onClick={() => void discovery.fetchNextPage()}>
            More people
          </Button>
        ) : null}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Delete the old discovery panel, verify, commit**

```bash
git rm src/features/users/components/discovery/UserCard.tsx src/features/users/components/discovery/UserDiscoveryPanel.tsx
npm run typecheck
npx eslint src/pages/PeoplePage.tsx src/features/users src/shared/hooks
git commit -m "Rebuild People: debounced search and person cards with the peel follow"
```

---

### Task 3.5: Alerts

**Files:**
- Modify (replace): `src/features/notifications/components/NotificationItem.tsx`, `src/features/notifications/components/NotificationsPanel.tsx`
- Delete: `src/features/notifications/components/NotificationTypeIcon.tsx`

- [ ] **Step 1: One alert**

**File:** `src/features/notifications/components/NotificationItem.tsx`

```tsx
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { formatDateTime, formatRelativeShort } from "@/shared/lib/dates";
import { Avatar } from "@/shared/kit/Avatar";
import { cx } from "@/shared/kit/cx";
import { IconButton } from "@/shared/kit/IconButton";
import { routes } from "@/app/router/routes";
import type { AppNotification } from "../model/notification.types";

interface Kind {
  sticker: StickerName;
  fill: string;
  label: string;
}

/** What happened, as the matching sticker on the actor's avatar. */
function kindOf(type: string): Kind {
  if (type.includes("follow")) return { sticker: "sparkle", fill: "var(--mint)", label: "Follow" };
  if (type.includes("like")) return { sticker: "heart", fill: "var(--ember)", label: "Like" };
  if (type.includes("share")) return { sticker: "share", fill: "var(--violet)", label: "Share" };
  return { sticker: "bubble", fill: "var(--blue)", label: "Comment" };
}

interface NotificationItemProps {
  notification: AppNotification;
  isMarking: boolean;
  onMarkRead: (notificationId: string) => void;
}

/**
 * One alert. An unread one sits on a surface with an ember dot. Marking it
 * read pops the dot, and the row settles into the page.
 */
export function NotificationItem({ notification, isMarking, onMarkRead }: NotificationItemProps) {
  const { actorId, actorName, actorPhoto, content, createdAt } = notification;
  const isUnread = !notification.isRead;
  const kind = kindOf(notification.type);
  const nameClass = "font-bold text-ink";

  return (
    <article
      className={cx(
        "flex items-start gap-3.5 rounded-card border p-4 transition-colors duration-300 sm:p-5",
        isUnread ? "border-line bg-surface" : "border-transparent",
      )}
    >
      <div className="relative shrink-0">
        {/* Alerts carry no handle, so no identity frame — just the face. */}
        <Avatar identityKey={actorName} name={actorName} photo={actorPhoto} frame={false} />
        <Sticker name={kind.sticker} fill={kind.fill} size={22} title={kind.label} className="absolute -right-2 -bottom-1.5" />
      </div>

      <div className="grid min-w-0 flex-1 gap-1">
        <p className={cx("break-words type-body", isUnread ? "text-ink" : "text-ink-2")}>
          {isUnread ? <span className="sr-only">Unread: </span> : null}
          {actorId ? (
            <Link
              to={routes.userProfile(actorId)}
              viewTransition
              className={cx(nameClass, "hover:underline hover:decoration-1 hover:underline-offset-4")}
            >
              {actorName}
            </Link>
          ) : (
            <span className={nameClass}>{actorName}</span>
          )}{" "}
          {content}
        </p>
        <time dateTime={createdAt ?? undefined} title={formatDateTime(createdAt)} className="type-caption text-ink-2 tnum">
          {formatRelativeShort(createdAt)}
        </time>
      </div>

      <AnimatePresence initial={false}>
        {isUnread ? (
          <motion.div
            key="unread"
            className="flex shrink-0 items-center gap-1"
            exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.2 } }}
          >
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-carbon bg-ember" />
            <IconButton
              glyph="check"
              label={`Mark as read: ${actorName}`}
              variant="ghost"
              size="sm"
              disabled={!notification.id || isMarking}
              onClick={() => onMarkRead(notification.id)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
```

- [ ] **Step 2: The list**

**File:** `src/features/notifications/components/NotificationsPanel.tsx`

```tsx
import { useState } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { Button } from "@/shared/kit/Button";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import { Tabs } from "@/shared/kit/Segmented";
import { ListSkeleton } from "@/shared/kit/Skeleton";
import { tabId, tabPanelId } from "@/shared/kit/tabIds";
import { useToast } from "@/shared/kit/toast/useToast";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks/useNotifications";
import type { NotificationFilter } from "../model/notification.types";
import { NotificationItem } from "./NotificationItem";

const TABS_ID = "alerts";

/** Everything that happened to your posts and your profile, newest first. */
export function NotificationsPanel() {
  const toast = useToast();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const onlyUnread = filter === "unread";

  const { data: notifications = [], isPending, error, refetch } = useNotifications(onlyUnread);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const fail = (failure: unknown) =>
    toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(failure, "Your alerts didn’t update. Try again.") });

  return (
    <div className="mx-auto grid max-w-(--reading) gap-6">
      <PosterHeader
        title="Alerts"
        lede="Likes, comments, shares and follows."
        actions={
          <Button
            variant="secondary"
            size="sm"
            iconStart="check"
            loading={markAll.isPending}
            disabled={unreadCount <= 0}
            onClick={() => markAll.mutate(undefined, { onSuccess: () => toast.show({ title: "All caught up." }), onError: fail })}
          >
            Mark all read
          </Button>
        }
      >
        <Tabs
          idBase={TABS_ID}
          label="Filter alerts"
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread", count: unreadCount > 0 ? unreadCount : undefined },
          ]}
          value={filter}
          onChange={setFilter}
          className="justify-self-start"
        />
      </PosterHeader>

      <div
        role="tabpanel"
        id={tabPanelId(TABS_ID, filter)}
        aria-labelledby={tabId(TABS_ID, filter)}
        aria-busy={isPending}
        className="grid gap-3"
      >
        {isPending ? (
          <ListSkeleton rows={5} label="Loading alerts" />
        ) : error ? (
          <ErrorState
            title="Alerts didn’t load"
            message={getErrorMessage(error, "Check your connection and try again.")}
            onRetry={() => void refetch()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            object="bell-deflated"
            title={onlyUnread ? "All caught up." : "Nothing yet."}
            body={
              onlyUnread
                ? "New alerts land here first."
                : "When someone likes, comments on or shares your posts — or follows you — it shows up here."
            }
          />
        ) : (
          <ol className="grid gap-2">
            {notifications.map((notification) => (
              <li key={notification.id || `${notification.actorName}-${notification.createdAt}`}>
                <NotificationItem
                  notification={notification}
                  isMarking={markOne.isPending && markOne.variables === notification.id}
                  onMarkRead={(notificationId) => markOne.mutate(notificationId, { onError: fail })}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Delete the old icon map, verify, commit**

```bash
git rm src/features/notifications/components/NotificationTypeIcon.tsx
npm run typecheck
npx eslint src/features/notifications
git commit -m "Rebuild Alerts: tabs, sticker kinds and the marked-read pop"
```

---

### Task 3.6: Settings

**Files:**
- Modify (replace): `src/features/auth/components/ChangePasswordForm.tsx`, `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Password form**

**File:** `src/features/auth/components/ChangePasswordForm.tsx`

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { getErrorMessage } from "@/shared/api/errors";
import { Button } from "@/shared/kit/Button";
import { PasswordField } from "@/shared/kit/PasswordField";
import { RuleList } from "@/shared/kit/RuleList";
import { useToast } from "@/shared/kit/toast/useToast";
import { useChangePassword } from "../hooks/useAuthMutations";
import { changePasswordSchema, type ChangePasswordFormValues } from "../model/auth.schemas";
import { passwordRules } from "../model/passwordRules";

/** Change the password. The new token is kept, so the session carries on. */
export function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const toast = useToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const newPassword = useWatch({ control, name: "newPassword" });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const result = await changePassword.mutateAsync({ password: values.currentPassword, newPassword: values.newPassword });
      reset();
      toast.show({ tone: "success", title: "Password changed.", description: result.message ?? "Use the new one next time you sign in." });
    } catch (error) {
      toast.show({
        tone: "error",
        title: "Couldn’t change your password",
        description: getErrorMessage(error, "Check your current password and try again."),
      });
    }
  };

  return (
    <form noValidate aria-label="Change password" onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <PasswordField {...field} label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} />
        )}
      />
      <div className="grid gap-3">
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <PasswordField {...field} label="New password" autoComplete="new-password" error={errors.newPassword?.message} />
          )}
        />
        <RuleList rules={passwordRules(newPassword)} />
      </div>
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <PasswordField {...field} label="Repeat new password" autoComplete="new-password" error={errors.confirmPassword?.message} />
        )}
      />
      <Button type="submit" loading={isSubmitting} className="justify-self-start">
        Update password
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: The page**

**File:** `src/pages/SettingsPage.tsx`

```tsx
import type { ReactNode } from "react";
import { Button } from "@/shared/kit/Button";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import { Toggle } from "@/shared/kit/Toggle";
import { useToast } from "@/shared/kit/toast/useToast";
import { useTheme } from "@/shared/lib/useTheme";
import { ChangePasswordForm } from "@/features/auth/components/ChangePasswordForm";
import { useAuth } from "@/features/auth/hooks/useAuth";

const THEME_TOGGLE_ID = "theme-toggle";

function SettingsSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="grid gap-5 rounded-card border border-line bg-surface p-5 sm:p-7">
      <h2 id={id} className="type-heading-sm">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Your paper, your password, and the way out. */
export default function SettingsPage() {
  const { theme, set } = useTheme();
  const { signOut } = useAuth();
  const toast = useToast();

  const setNight = (night: boolean) => {
    // The new paper peels on from the switch itself.
    const box = document.getElementById(THEME_TOGGLE_ID)?.getBoundingClientRect();
    set(night ? "dark" : "light", box ? { x: box.left + box.width / 2, y: box.top + box.height / 2 } : undefined);
  };

  const leave = () => {
    signOut();
    toast.show({ title: "Signed out. See you soon." });
  };

  return (
    <div className="mx-auto grid max-w-(--reading) gap-6">
      <PosterHeader title="Settings" lede="Your paper, your password, and the way out." />

      <SettingsSection id="settings-paper" title="Paper">
        <Toggle
          id={THEME_TOGGLE_ID}
          label="Night paper"
          description="Dark paper for late scrolling. Until you choose, Aura follows your device."
          checked={theme === "dark"}
          onChange={setNight}
        />
      </SettingsSection>

      <SettingsSection id="settings-password" title="Password">
        <ChangePasswordForm />
      </SettingsSection>

      <SettingsSection id="settings-session" title="Session">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="type-body text-ink-2">You’re signed in on this device.</p>
          <Button variant="secondary" iconStart="logout" onClick={leave}>
            Sign out
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
```

- [ ] **Step 3: Verify and commit**

```bash
npm run typecheck
npx eslint src/pages/SettingsPage.tsx src/features/auth
git commit -m "Rebuild Settings: night paper switch, password rules and sign out"
```

---

### Task 3.7: Profile

**Files:**
- Modify: `src/features/users/hooks/useUserProfile.ts` (add `refetch`), `src/styles/kit.css` (range slider)
- Modify (replace): `src/features/users/hooks/useProfileImages.ts`, `src/features/users/components/profile/ImageViewerModal.tsx`, `src/features/users/components/profile/ProfilePhotoEditorModal.tsx`, `src/pages/ProfilePage.tsx`
- Create in `src/features/users/components/profile/`: `ProfileCover.tsx`, `ProfileHeader.tsx`, `OwnProfileActions.tsx`
- Delete from `profile/`: `CollectionHeader.tsx`, `CoverPrivacyModal.tsx`, `profileIcons.tsx`, `ProfileTabs.tsx`

- [ ] **Step 1: Hooks**

In `src/features/users/hooks/useUserProfile.ts`, add one line to the returned object after `error`:

```ts
    refetch: query.refetch,
```

**File:** `src/features/users/hooks/useProfileImages.ts`

```ts
import { useState } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { useToast } from "@/shared/kit/toast/useToast";
import { cropToSquare, readFileAsDataUrl, type Offset } from "../lib/imageCrop";
import { useUploadCoverPhoto, useUploadProfilePhoto } from "./useProfilePhotoUpload";

/**
 * Everything the profile page needs to change its avatar and cover: staged
 * files, local previews, the two dialogs, and the upload mutations. Results
 * are reported as toasts.
 *
 * Previews are keyed by profile so a preview from one profile never bleeds onto
 * another after navigation — the behaviour the page implemented with a
 * `profileKey` on each piece of state.
 */
export function useProfileImages(profileKey: string, canEdit: boolean) {
  const uploadPhoto = useUploadProfilePhoto();
  const uploadCover = useUploadCoverPhoto();
  const toast = useToast();

  const [previewKey, setPreviewKey] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");
  const [isCoverRemoved, setIsCoverRemoved] = useState(false);

  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoEditorUrl, setPhotoEditorUrl] = useState("");

  const isForCurrentProfile = previewKey === profileKey;

  function fail(message: string) {
    toast.show({ tone: "error", title: "Upload failed", description: message });
  }

  function succeed(title: string) {
    toast.show({ tone: "success", title });
  }

  /** Shared validation for both pickers. Resets the input so re-picking works. */
  function takeFile(event: React.ChangeEvent<HTMLInputElement>): File | null {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) return null;

    if (!file.type.startsWith("image/")) {
      fail("Choose an image file.");
      return null;
    }

    if (!canEdit) {
      fail("You can only change images on your own profile.");
      return null;
    }

    return file;
  }

  function selectCoverFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = takeFile(event);
    if (!file) return;

    setIsCoverRemoved(false);
    setPendingCoverFile(file);
  }

  async function confirmCoverUpload() {
    if (!pendingCoverFile) return;

    const file = pendingCoverFile;
    setPendingCoverFile(null);

    let preview = "";
    try {
      preview = await readFileAsDataUrl(file);
    } catch {
      preview = "";
    }

    uploadCover.mutate(file, {
      onSuccess: () => {
        if (preview) {
          setPreviewKey(profileKey);
          setCoverPreview(preview);
        }
        setIsCoverRemoved(false);
        succeed("Cover updated.");
      },
      onError: (error) => fail(getErrorMessage(error, "Your cover didn’t upload. Try again.")),
    });
  }

  function removeCover() {
    if (!canEdit || uploadCover.isPending) return;
    setPreviewKey(profileKey);
    setCoverPreview("");
    setIsCoverRemoved(true);
    succeed("Cover removed.");
  }

  async function selectPhotoFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = takeFile(event);
    if (!file) return;

    try {
      const preview = await readFileAsDataUrl(file);
      if (!preview) throw new Error("Failed to preview selected profile photo.");

      setPendingPhotoFile(file);
      setPhotoEditorUrl(preview);
    } catch {
      fail("That image couldn’t be opened. Try another.");
    }
  }

  function cancelPhotoEditor() {
    if (uploadPhoto.isPending) return;
    setPendingPhotoFile(null);
    setPhotoEditorUrl("");
  }

  async function saveCroppedPhoto(zoom: number, offset: Offset) {
    if (!pendingPhotoFile || uploadPhoto.isPending) return;

    try {
      const { file, previewUrl } = await cropToSquare(photoEditorUrl, pendingPhotoFile, zoom, offset);

      setPreviewKey(profileKey);
      setAvatarPreview(previewUrl);
      setPendingPhotoFile(null);
      setPhotoEditorUrl("");

      uploadPhoto.mutate(file, {
        onSuccess: () => succeed("Photo updated."),
        onError: (error) => {
          setAvatarPreview("");
          fail(getErrorMessage(error, "Your photo didn’t upload. Try again."));
        },
      });
    } catch (error) {
      fail(getErrorMessage(error, "That photo couldn’t be prepared. Try another."));
    }
  }

  return {
    avatarPreview: isForCurrentProfile ? avatarPreview : "",
    coverPreview: isForCurrentProfile ? coverPreview : "",
    isCoverRemoved: isForCurrentProfile && isCoverRemoved,

    isCoverPending: uploadCover.isPending,
    isPhotoPending: uploadPhoto.isPending,

    isCoverDialogOpen: pendingCoverFile !== null,
    photoEditorUrl,

    selectCoverFile,
    confirmCoverUpload,
    cancelCoverUpload: () => {
      if (uploadCover.isPending) return;
      setPendingCoverFile(null);
    },
    removeCover,

    selectPhotoFile,
    cancelPhotoEditor,
    saveCroppedPhoto,
  };
}
```

- [ ] **Step 2: Range slider style**

Append to `src/styles/kit.css`, before the final `@media (prefers-reduced-motion)` block:

```css
/* ── range: a sun sticker on a pill track ─────────────────────── */
.kit-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 32px;
  background: transparent;
  cursor: pointer;
}
.kit-range:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.kit-range:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 4px;
  border-radius: 999px;
}
.kit-range::-webkit-slider-runnable-track {
  height: 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-2);
}
.kit-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  margin-top: -9px;
  border: 1.5px solid var(--carbon);
  border-radius: 50%;
  background: var(--sun);
  cursor: grab;
}
.kit-range::-moz-range-track {
  height: 8px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-2);
}
.kit-range::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--carbon);
  border-radius: 50%;
  background: var(--sun);
  cursor: grab;
}
```

- [ ] **Step 3: Modals**

**File:** `src/features/users/components/profile/ImageViewerModal.tsx`

```tsx
import { useState } from "react";
import { Modal } from "@/shared/kit/Modal";

interface ViewedImage {
  url: string;
  alt: string;
}

/** A photo or a cover at full size. */
export function ImageViewerModal({ image, onClose }: { image: ViewedImage | null; onClose: () => void }) {
  // Keep showing the last image while the sheet animates away.
  const [shown, setShown] = useState(image);
  if (image && image !== shown) setShown(image);

  return (
    <Modal open={image !== null} onClose={onClose} title={shown?.alt ?? "Image"} hideTitle size="lg">
      {shown ? (
        <img
          src={shown.url}
          alt={shown.alt}
          className="mx-auto block max-h-[70dvh] w-auto max-w-full rounded-chip border border-line object-contain"
        />
      ) : null}
    </Modal>
  );
}
```

**File:** `src/features/users/components/profile/ProfilePhotoEditorModal.tsx`

```tsx
import { useRef, useState, type KeyboardEvent, type PointerEvent, type SyntheticEvent } from "react";
import { Button } from "@/shared/kit/Button";
import { Modal } from "@/shared/kit/Modal";
import { clamp, clampOffset, getCropScale, PROFILE_CROP_SIZE, type Offset, type Size } from "../../lib/imageCrop";

const NUDGE = 12;
const ARROWS: Record<string, Offset> = {
  ArrowLeft: { x: -NUDGE, y: 0 },
  ArrowRight: { x: NUDGE, y: 0 },
  ArrowUp: { x: 0, y: -NUDGE },
  ArrowDown: { x: 0, y: NUDGE },
};

interface ProfilePhotoEditorModalProps {
  /** The picked image as a data URL; empty while the editor is closed. */
  imageUrl: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (zoom: number, offset: Offset) => void;
}

/**
 * Frame the new photo: drag it (or use the arrow keys) and zoom. The circle is
 * drawn at the crop's real size, so what you frame is exactly what is saved.
 */
export function ProfilePhotoEditorModal({ imageUrl, saving, onCancel, onSave }: ProfilePhotoEditorModalProps) {
  const [source, setSource] = useState(imageUrl);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [natural, setNatural] = useState<Size>({ width: 0, height: 0 });
  const drag = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  // A new image starts centred at 1×.
  if (imageUrl !== source) {
    setSource(imageUrl);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setNatural({ width: 0, height: 0 });
  }

  const scale = getCropScale(natural, zoom);
  const hasSize = natural.width > 0 && natural.height > 0;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!hasSize) return;
    drag.current = { active: true, startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const { startX, startY, originX, originY } = drag.current;
    setOffset(clampOffset({ x: originX + event.clientX - startX, y: originY + event.clientY - startY }, natural, zoom));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROWS[event.key];
    if (!step || !hasSize) return;
    event.preventDefault();
    setOffset((current) => clampOffset({ x: current.x + step.x, y: current.y + step.y }, natural, zoom));
  };

  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const size = { width: event.currentTarget.naturalWidth || 0, height: event.currentTarget.naturalHeight || 0 };
    setNatural(size);
    setOffset((current) => clampOffset(current, size, zoom));
  };

  return (
    <Modal
      open={Boolean(imageUrl)}
      onClose={onCancel}
      title="Frame your photo"
      description="Drag it into place, then zoom. The circle is what everyone sees."
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!hasSize} onClick={() => onSave(zoom, offset)}>
            Save photo
          </Button>
        </>
      }
    >
      <div className="grid justify-items-center gap-6">
        <div
          role="group"
          tabIndex={0}
          aria-label="Photo position. Drag it, or use the arrow keys."
          className="relative shrink-0 cursor-grab touch-none overflow-hidden rounded-full bg-surface-2 ring-2 ring-carbon outline-offset-4 active:cursor-grabbing"
          style={{ width: PROFILE_CROP_SIZE, height: PROFILE_CROP_SIZE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          {imageUrl ? (
            <img
              alt=""
              src={imageUrl}
              draggable={false}
              onLoad={onLoad}
              className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
              style={{
                width: natural.width || PROFILE_CROP_SIZE,
                height: natural.height || PROFILE_CROP_SIZE,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                transformOrigin: "center",
              }}
            />
          ) : null}
        </div>

        <label className="grid w-full max-w-[320px] gap-2">
          <span className="flex items-center justify-between type-label">
            <span>Zoom</span>
            <span className="text-ink-2 tnum">{zoom.toFixed(2)}×</span>
          </span>
          <input
            type="range"
            className="kit-range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={saving || !hasSize}
            onChange={(event) => {
              const next = clamp(Number(event.target.value) || 1, 1, 3);
              setZoom(next);
              setOffset((current) => clampOffset(current, natural, next));
            }}
          />
        </label>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 4: Cover, header and your own actions**

**File:** `src/features/users/components/profile/ProfileCover.tsx`

```tsx
import { useRef, type ChangeEvent } from "react";
import { identityFor } from "@/shared/brand/identity";
import { shapePath } from "@/shared/brand/shapes";
import { Button } from "@/shared/kit/Button";
import { Menu, type MenuItem, type MenuTriggerProps } from "@/shared/kit/Menu";

/** Paper stickers of the person's own shape, stuck across their colour. */
const STAMPS = [
  { x: 1010, y: 150, scale: 3.2, rotate: 12 },
  { x: 170, y: 250, scale: 1.7, rotate: -18 },
  { x: 610, y: 36, scale: 1.05, rotate: 28 },
];

function CoverTrigger({ label, ...props }: MenuTriggerProps) {
  return (
    <Button variant="secondary" size="sm" iconStart="camera" aria-label={label} {...props}>
      Cover
    </Button>
  );
}

interface ProfileCoverProps {
  identityKey: string;
  name: string;
  coverUrl: string;
  canEdit: boolean;
  isUpdating: boolean;
  onView: () => void;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

/** The band across the top of a profile: their cover, or their own colour stuck with their own shape. */
export function ProfileCover({ identityKey, name, coverUrl, canEdit, isUpdating, onView, onSelect, onRemove }: ProfileCoverProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const identity = identityFor(identityKey);
  const path = shapePath(identity.shape, 46, identity.seed);

  const pick: MenuItem = {
    label: coverUrl ? "Change cover" : "Add a cover",
    glyph: "camera",
    disabled: isUpdating,
    onSelect: () => fileRef.current?.click(),
  };
  const items: MenuItem[] = coverUrl
    ? [
        pick,
        { label: "View cover", glyph: "image", onSelect: onView },
        { label: "Remove cover", glyph: "trash", tone: "danger", disabled: isUpdating, onSelect: onRemove },
      ]
    : [pick];

  return (
    <div className="relative">
      <div
        className="relative h-40 overflow-hidden rounded-card-lg border border-line sm:h-56 lg:h-72"
        style={{ background: identity.color.hex }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg aria-hidden viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            {STAMPS.map((stamp) => (
              <path
                key={stamp.x}
                d={path}
                transform={`translate(${stamp.x} ${stamp.y}) rotate(${stamp.rotate + identity.tilt}) scale(${stamp.scale})`}
                style={{ fill: "var(--paper)", fillOpacity: 0.3, stroke: "var(--carbon)", strokeOpacity: 0.55 }}
                strokeWidth={1.5}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}
        {!canEdit && coverUrl ? (
          <button type="button" onClick={onView} aria-label={`View ${name}’s cover`} className="absolute inset-0 cursor-zoom-in" />
        ) : null}
        {isUpdating ? (
          <span role="status" className="absolute bottom-3 left-3 rounded-pill border border-carbon bg-paper px-3 py-1.5 type-label text-carbon">
            Uploading cover…
          </span>
        ) : null}
      </div>

      {canEdit ? (
        <div className="absolute top-3 right-3">
          <input ref={fileRef} type="file" accept="image/*" tabIndex={-1} aria-hidden className="sr-only" onChange={onSelect} />
          <Menu label="Cover options" items={items} trigger={CoverTrigger} />
        </div>
      ) : null}
    </div>
  );
}
```

**File:** `src/features/users/components/profile/OwnProfileActions.tsx`

```tsx
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { Menu, type MenuItem } from "@/shared/kit/Menu";
import { useToast } from "@/shared/kit/toast/useToast";
import { useTheme } from "@/shared/lib/useTheme";
import { routes } from "@/app/router/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** On your own page: Settings, with the paper switch and sign-out one tap away. */
export function OwnProfileActions() {
  const { theme, toggle } = useTheme();
  const { signOut } = useAuth();
  const toast = useToast();

  const items: MenuItem[] = [
    {
      label: theme === "dark" ? "Switch to Paper" : "Switch to Night paper",
      glyph: theme === "dark" ? "sun" : "moon",
      onSelect: () => toggle(),
    },
    {
      label: "Sign out",
      glyph: "logout",
      tone: "danger",
      onSelect: () => {
        signOut();
        toast.show({ title: "Signed out. See you soon." });
      },
    },
  ];

  return (
    <>
      <ButtonLink to={routes.settings} viewTransition variant="secondary" size="sm">
        Settings
      </ButtonLink>
      <Menu label="More options" items={items} />
    </>
  );
}
```

**File:** `src/features/users/components/profile/ProfileHeader.tsx`

```tsx
import type { ChangeEvent, ReactNode } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { PeelLoader } from "@/shared/brand/PeelLoader";
import { Avatar } from "@/shared/kit/Avatar";
import { Counter } from "@/shared/kit/Counter";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import type { User } from "../../model/user.types";
import { ProfileCover } from "./ProfileCover";

interface ProfileHeaderProps {
  profile: User;
  avatarUrl: string;
  coverUrl: string;
  canEdit: boolean;
  postsCount: number;
  followersCount: number;
  /** Follow for someone else; Settings and the menu on your own page. */
  actions: ReactNode;
  photoUploading: boolean;
  coverUpdating: boolean;
  /** Omitted when there is no real photo to look at. */
  onViewPhoto?: () => void;
  onSelectPhoto: (event: ChangeEvent<HTMLInputElement>) => void;
  onViewCover: () => void;
  onSelectCover: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveCover: () => void;
}

/** The top of a profile: band, sticker, name as a poster, and the counts. */
export function ProfileHeader({
  profile,
  avatarUrl,
  coverUrl,
  canEdit,
  postsCount,
  followersCount,
  actions,
  photoUploading,
  coverUpdating,
  onViewPhoto,
  onSelectPhoto,
  onViewCover,
  onSelectCover,
  onRemoveCover,
}: ProfileHeaderProps) {
  const identityKey = profile.handle || profile.username || profile.name;
  const avatar = <Avatar identityKey={identityKey} name={profile.name} photo={avatarUrl} size="xl" />;
  const stats = [
    { label: "Posts", value: postsCount },
    { label: "Followers", value: followersCount },
    { label: "Following", value: profile.followingCount },
  ];

  return (
    <section aria-label="Profile" className="grid">
      <ProfileCover
        identityKey={identityKey}
        name={profile.name}
        coverUrl={coverUrl}
        canEdit={canEdit}
        isUpdating={coverUpdating}
        onView={onViewCover}
        onSelect={onSelectCover}
        onRemove={onRemoveCover}
      />

      <div className="-mt-16 flex flex-wrap items-end justify-between gap-4 px-3 sm:-mt-20 sm:px-8">
        <div className="relative">
          {onViewPhoto ? (
            <button type="button" onClick={onViewPhoto} aria-label={`View ${profile.name}’s photo`} className="block cursor-zoom-in rounded-full">
              {avatar}
            </button>
          ) : (
            avatar
          )}
          {canEdit ? (
            <label className="absolute right-1 bottom-1 grid h-11 w-11 cursor-pointer place-items-center rounded-full border border-carbon bg-sun text-carbon transition-transform duration-200 hover:-rotate-6 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--focus)">
              <span className="sr-only">Change your photo</span>
              {photoUploading ? <PeelLoader size={22} label="Uploading photo" /> : <Glyph name="camera" size={20} />}
              <input type="file" accept="image/*" className="sr-only" disabled={photoUploading} onChange={onSelectPhoto} />
            </label>
          ) : null}
        </div>
        <div className="flex items-center gap-2 pb-2">{actions}</div>
      </div>

      <PosterHeader size="xl" title={profile.name} eyebrow={profile.handle} />

      <dl className="flex flex-wrap gap-x-10 gap-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="grid gap-1">
            <dt className="order-2 type-label text-ink-2">{stat.label}</dt>
            <dd className="order-1 type-heading">
              <Counter value={stat.value} />
            </dd>
          </div>
        ))}
      </dl>

      {canEdit && profile.email ? <p className="mt-4 type-caption text-ink-2">{profile.email}</p> : null}
    </section>
  );
}
```

- [ ] **Step 5: The page**

**File:** `src/pages/ProfilePage.tsx`

```tsx
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import type { ObjectName } from "@/assets/objects/manifest";
import { getErrorMessage } from "@/shared/api/errors";
import { DEFAULT_PROFILE_IMAGE } from "@/shared/config/constants";
import { FollowButton } from "@/shared/kit/ActionButtons";
import { ConfirmDialog } from "@/shared/kit/ConfirmDialog";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { Tabs } from "@/shared/kit/Segmented";
import { PostSkeleton, Skeleton } from "@/shared/kit/Skeleton";
import { tabId, tabPanelId } from "@/shared/kit/tabIds";
import { useToast } from "@/shared/kit/toast/useToast";
import { routes } from "@/app/router/routes";
import { PostCard } from "@/features/posts/components/PostCard";
import { useComposer } from "@/features/posts/composer/useComposer";
import { useUserPosts } from "@/features/posts/hooks/usePostsQueries";
import { extractSavedPostsFromProfile } from "@/features/posts/model/post.normalize";
import { ImageViewerModal } from "@/features/users/components/profile/ImageViewerModal";
import { OwnProfileActions } from "@/features/users/components/profile/OwnProfileActions";
import { ProfileHeader } from "@/features/users/components/profile/ProfileHeader";
import { ProfilePhotoEditorModal } from "@/features/users/components/profile/ProfilePhotoEditorModal";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { useProfileImages } from "@/features/users/hooks/useProfileImages";
import { useToggleFollow, type FollowOverride } from "@/features/users/hooks/useToggleFollow";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";

type ProfileTab = "posts" | "saved";
type ImageView = { url: string; alt: string } | null;

const TABS_ID = "profile";

interface EmptyTab {
  object: ObjectName;
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
}

function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Loading profile" className="grid gap-6 pt-4 sm:pt-6">
      <Skeleton shape="block" className="h-40 sm:h-56 lg:h-72" />
      <Skeleton shape="circle" className="-mt-20 ml-4 h-32 w-32" />
      <Skeleton shape="block" className="w-3/4" style={{ height: "clamp(72px, 16vw, 200px)" }} />
      <div className="flex gap-10">
        <Skeleton className="w-16" />
        <Skeleton className="w-16" />
        <Skeleton className="w-16" />
      </div>
    </div>
  );
}

/** A person's page: their band, their sticker, their name as a poster, and their posts. */
export default function ProfilePage() {
  const { userId: routeUserId } = useParams();
  const toast = useToast();
  const composer = useComposer();
  const [tab, setTab] = useState<ProfileTab>("posts");
  const [imageView, setImageView] = useState<ImageView>(null);
  const [followOverrides, setFollowOverrides] = useState<Record<string, FollowOverride>>({});

  const currentUserQuery = useCurrentUser();
  const { profile, isOtherProfile, activeUserId, isLoading, error, refetch } = useUserProfile(routeUserId, currentUserQuery.data ?? null);
  // The route sits behind RequireAuth, so "not someone else's" means yours.
  const canEdit = !isOtherProfile;

  const images = useProfileImages(activeUserId ?? "me", canEdit);
  const follow = useToggleFollow(followOverrides, setFollowOverrides);
  const postsQuery = useUserPosts(activeUserId);
  const savedPosts = useMemo(() => extractSavedPostsFromProfile(profile?.raw ?? null), [profile]);

  const userPosts = postsQuery.data ?? [];
  const shownPosts = tab === "saved" ? savedPosts : userPosts;

  if (currentUserQuery.isLoading || isLoading) return <ProfileSkeleton />;

  const profileError = isOtherProfile ? error : currentUserQuery.error;
  if (profileError) {
    return (
      <ErrorState
        className="mt-8"
        title="This profile didn’t load"
        message={getErrorMessage(profileError, "Check your connection and try again.")}
        onRetry={() => void (isOtherProfile ? refetch() : currentUserQuery.refetch())}
      />
    );
  }

  if (!profile) {
    return (
      <EmptyState
        className="mt-8"
        object="bubble-popped"
        title="This profile popped."
        body="The account may be gone, or the link is wrong."
        action={{ label: "Find people", to: routes.people }}
      />
    );
  }

  const avatarUrl = images.avatarPreview || profile.photo || "";
  const coverUrl = images.isCoverRemoved ? images.coverPreview : images.coverPreview || (profile.coverPhoto ?? "");
  const hasPhoto = Boolean(avatarUrl) && avatarUrl !== DEFAULT_PROFILE_IMAGE;
  const followState = follow.resolve(isOtherProfile ? profile.id : null, profile.isFollowing, profile.followersCount);
  const profileId = profile.id;

  const toggleFollow = () => {
    if (!profileId) return;
    follow.toggle(
      { userId: profileId, currentIsFollowing: followState.isFollowing, currentFollowersCount: followState.followersCount },
      {
        onError: (failure) =>
          toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(failure, "Your follow didn’t save. Try again.") }),
      },
    );
  };

  const empty: EmptyTab =
    tab === "saved"
      ? {
          object: "bookmark-deflated",
          title: "Nothing saved yet.",
          body: canEdit ? "Tap the bookmark on any post to keep it here." : "Posts they save show up here.",
        }
      : canEdit
        ? {
            object: "bubble-deflated",
            title: "You haven’t posted yet.",
            body: "Say something — words alone are plenty.",
            action: { label: "Write a post", onClick: composer.open },
          }
        : { object: "bubble-deflated", title: "Nothing posted yet.", body: "When they post, it shows up here." };

  return (
    <div className="grid gap-10 pt-4 sm:pt-6">
      <ProfileHeader
        profile={profile}
        avatarUrl={avatarUrl}
        coverUrl={coverUrl}
        canEdit={canEdit}
        postsCount={userPosts.length}
        followersCount={followState.followersCount}
        actions={
          canEdit ? (
            <OwnProfileActions />
          ) : (
            <FollowButton
              name={profile.name}
              following={followState.isFollowing}
              pending={follow.pendingUserId === profileId}
              onToggle={toggleFollow}
            />
          )
        }
        photoUploading={images.isPhotoPending}
        coverUpdating={images.isCoverPending}
        onViewPhoto={hasPhoto ? () => setImageView({ url: avatarUrl, alt: `${profile.name}’s photo` }) : undefined}
        onSelectPhoto={(event) => void images.selectPhotoFile(event)}
        onViewCover={() => {
          if (coverUrl) setImageView({ url: coverUrl, alt: `${profile.name}’s cover` });
        }}
        onSelectCover={images.selectCoverFile}
        onRemoveCover={images.removeCover}
      />

      <div className="mx-auto grid w-full max-w-(--reading) gap-6">
        <Tabs
          idBase={TABS_ID}
          label={`${profile.name}’s posts`}
          options={[
            { value: "posts", label: "Posts", count: userPosts.length },
            { value: "saved", label: "Saved", count: savedPosts.length },
          ]}
          value={tab}
          onChange={setTab}
          className="justify-self-start"
        />

        <div role="tabpanel" id={tabPanelId(TABS_ID, tab)} aria-labelledby={tabId(TABS_ID, tab)} className="grid gap-5">
          {tab === "posts" && postsQuery.isPending ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : tab === "posts" && postsQuery.error ? (
            <ErrorState
              title="Posts didn’t load"
              message={getErrorMessage(postsQuery.error, "Check your connection and try again.")}
              onRetry={() => void postsQuery.refetch()}
            />
          ) : shownPosts.length === 0 ? (
            <EmptyState object={empty.object} title={empty.title} body={empty.body} action={empty.action} />
          ) : (
            <ol className="grid gap-5">
              {shownPosts.map((post, index) => (
                <li key={post.id}>
                  <PostCard post={post} index={index} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <ImageViewerModal image={imageView} onClose={() => setImageView(null)} />
      <ConfirmDialog
        open={images.isCoverDialogOpen}
        onClose={images.cancelCoverUpload}
        onConfirm={() => void images.confirmCoverUpload()}
        title="Use this cover?"
        description="It replaces your current cover, and a post about the change appears on your profile."
        confirmLabel="Use cover"
        loading={images.isCoverPending}
      />
      <ProfilePhotoEditorModal
        imageUrl={images.photoEditorUrl}
        saving={images.isPhotoPending}
        onCancel={images.cancelPhotoEditor}
        onSave={(zoom, offset) => void images.saveCroppedPhoto(zoom, offset)}
      />
    </div>
  );
}
```

- [ ] **Step 6: Kit specimen**

The profile page needs a session, so the kit shows the header (sample person, no cover) and the photo framer. Nothing in it reaches the API. `KitPage` renders `<ProfileSection />` after `<PostsSection />`.

**File:** `src/pages/kit/ProfileSection.tsx`

```tsx
import { useState } from "react";
import { FollowButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { ProfileHeader } from "@/features/users/components/profile/ProfileHeader";
import { ProfilePhotoEditorModal } from "@/features/users/components/profile/ProfilePhotoEditorModal";
import type { User } from "@/features/users/model/user.types";
import { KitBlock } from "./KitBlock";

const SAMPLE: User = {
  id: "kit-profile",
  name: "Idris Okafor",
  username: "idris.okafor",
  handle: "@idris.okafor",
  email: null,
  photo: "",
  coverPhoto: null,
  followersCount: 1204,
  followingCount: 87,
  bookmarksCount: 0,
  isFollowing: false,
  raw: {},
};

const noop = () => {};

/** The profile head with sample data, and the photo framer. Nothing here reaches the API. */
export function ProfileSection() {
  const [following, setFollowing] = useState(false);
  const [framing, setFraming] = useState("");

  return (
    <div className="grid gap-16" id="profile">
      <h2 className="type-display">Profile</h2>
      <KitBlock title="Profile header" note="Sample person, no cover: their identity colour stuck with their own shape.">
        <ProfileHeader
          profile={SAMPLE}
          avatarUrl=""
          coverUrl=""
          canEdit={false}
          postsCount={42}
          followersCount={SAMPLE.followersCount + (following ? 1 : 0)}
          actions={<FollowButton name={SAMPLE.name} following={following} onToggle={() => setFollowing((value) => !value)} />}
          photoUploading={false}
          coverUpdating={false}
          onSelectPhoto={noop}
          onViewCover={noop}
          onSelectCover={noop}
          onRemoveCover={noop}
        />
      </KitBlock>
      <KitBlock title="Photo framer" note="Drag, arrow keys, zoom. Save just closes it here.">
        <Button variant="secondary" iconStart="camera" className="justify-self-start" onClick={() => setFraming("/og.png")}>
          Open the framer
        </Button>
        <ProfilePhotoEditorModal imageUrl={framing} saving={false} onCancel={() => setFraming("")} onSave={() => setFraming("")} />
      </KitBlock>
    </div>
  );
}
```

- [ ] **Step 7: Delete the old profile parts, verify, commit**

```bash
git rm src/features/users/components/profile/CollectionHeader.tsx src/features/users/components/profile/CoverPrivacyModal.tsx src/features/users/components/profile/profileIcons.tsx src/features/users/components/profile/ProfileTabs.tsx
npm run typecheck
npx eslint src/pages/ProfilePage.tsx src/features/users
git commit -m "Rebuild Profile: identity band, xl name poster, photo framer and tabs"
```

---

### Task 3.8: 404, and remove the legacy UI

**Files:**
- Modify (replace): `src/pages/NotFoundPage.tsx`, `src/app/providers/AppProviders.tsx`
- Modify: `src/index.css` (drop the `legacy.css` import), `src/styles/tokens.css` (reset the default palette)
- Delete: `src/shared/ui/` (all), `src/shared/lib/aura.ts`, `src/features/posts/components/WorkPlate.tsx`, `src/features/posts/components/Wall.tsx`, `src/styles/legacy.css`

- [ ] **Step 1: 404**

**File:** `src/pages/NotFoundPage.tsx`

```tsx
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { ButtonLink } from "@/shared/kit/ButtonLink";
import { routes } from "@/app/router/routes";
import { useAuth } from "@/features/auth/hooks/useAuth";

/** Nothing at this address: the popped bubble, and the way back. */
export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="grid justify-items-center gap-5 py-12 text-center sm:py-16">
      <div className="w-56 sm:w-72">
        <ObjectArt name="bubble-popped" sizes="288px" />
      </div>
      <h1 className="type-display text-balance">This one popped</h1>
      <p className="max-w-[44ch] type-body-lg text-ink-2">There’s nothing at this address. It may have moved, or it never existed.</p>
      <ButtonLink to={isAuthenticated ? routes.home : routes.login} viewTransition size="lg">
        {isAuthenticated ? "Back to the wall" : "Go to sign in"}
      </ButtonLink>
    </section>
  );
}
```

- [ ] **Step 2: One toast provider**

**File:** `src/app/providers/AppProviders.tsx`

```tsx
import { MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import { ToastProvider } from "@/shared/kit/toast/ToastProvider";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { AppErrorBoundary } from "./AppErrorBoundary";

/**
 * Provider stack for the whole app.
 *
 * `MotionConfig reducedMotion="user"` makes every Motion animation honour
 * `prefers-reduced-motion` by default; components still opt out of loops
 * through `useMotionPrefs()`.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </MotionConfig>
    </AppErrorBoundary>
  );
}
```

- [ ] **Step 3: Delete the legacy UI and its styles**

```bash
git rm -r src/shared/ui src/shared/lib/aura.ts src/features/posts/components/WorkPlate.tsx src/features/posts/components/Wall.tsx src/styles/legacy.css
```

- In `src/index.css`, remove the line `@import "./styles/legacy.css";`.
- In `src/styles/tokens.css`, make the first line inside `@theme inline {` read `--color-*: initial;`, followed by a comment line: `/* Only Aura's colours exist — Tailwind's default palette is switched off. */`.

Before deleting, confirm that nothing outside the deleted files still uses the legacy UI. Each of these must return nothing:

```bash
grep -rn "shared/ui\|lib/aura\|WorkPlate\|components/Wall\"" src
grep -rnE "\b(bg|text|border|ring|outline|fill|stroke)-(white|black|gray|slate|zinc|neutral|stone|red|orange|amber|yellow|green|emerald|teal|cyan|indigo|purple|pink|rose)(-[0-9]+)?\b" src
grep -rnE "\b(text-(micro|label|read|sm|base|lg|xl|2xl|3xl)|font-(mono|serif|wordmark)|verm|recess|rail|plate|gold-ink)\b" src --include=*.tsx
```

- [ ] **Step 4: Verify everything, then commit**

```bash
npm run typecheck
npm run lint
npm run build
```

Browser:
- `/nope` as a guest shows the popped bubble and "Go to sign in".
- `/__kit` renders every section, with no console errors.
- `/auth/login` and `/auth/register` are unchanged.
- With the user's session, look at every page at 375 / 768 / 1280 / 1440 in both themes.

```bash
git commit -m "Remove the Accession Card UI: 404 rebuilt, legacy styles and toasts gone, default palette off"
```
