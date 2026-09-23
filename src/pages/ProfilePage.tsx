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
    <div role="status" aria-label="Loading profile" className="grid grid-cols-[minmax(0,1fr)] gap-6 pt-4 sm:pt-6">
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
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 pt-4 sm:pt-6">
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

      <div className="mx-auto grid w-full max-w-(--reading) grid-cols-[minmax(0,1fr)] gap-6">
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

        <div role="tabpanel" id={tabPanelId(TABS_ID, tab)} aria-labelledby={tabId(TABS_ID, tab)} className="grid grid-cols-[minmax(0,1fr)] gap-5">
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
            <ol className="grid grid-cols-[minmax(0,1fr)] gap-5">
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
