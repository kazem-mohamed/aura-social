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
