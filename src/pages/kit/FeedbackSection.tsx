import { useState } from "react";
import { CommentButton, FollowButton, LikeButton, SaveButton, ShareButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { Counter } from "@/shared/kit/Counter";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { Marquee } from "@/shared/kit/Marquee";
import { ListSkeleton, PostSkeleton } from "@/shared/kit/Skeleton";
import { KitBlock } from "./KitBlock";

export function FeedbackSection() {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(41);
  const [saved, setSaved] = useState(false);
  const [shares, setShares] = useState(3);
  const [following, setFollowing] = useState(false);
  const [count, setCount] = useState(1204);

  return (
    <div className="grid gap-16" id="feedback">
      <h2 className="type-display">Feedback</h2>

      <KitBlock title="Social actions" note="Like inflates with a confetti burst, save drops and sticks, share spins, follow peels.">
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface p-3">
          <LikeButton
            liked={liked}
            count={likes}
            onToggle={() => {
              setLiked((value) => !value);
              setLikes((value) => value + (liked ? -1 : 1));
            }}
          />
          <CommentButton count={7} onClick={() => undefined} />
          <ShareButton count={shares} onClick={() => setShares((value) => value + 1)} />
          <SaveButton saved={saved} onToggle={() => setSaved((value) => !value)} />
          <span className="ml-auto" />
          <FollowButton following={following} onToggle={() => setFollowing((value) => !value)} name="Leila Harb" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LikeButton liked count={2} onToggle={() => undefined} size="sm" />
          <FollowButton following onToggle={() => undefined} size="sm" />
          <FollowButton following={false} pending onToggle={() => undefined} size="sm" />
        </div>
      </KitBlock>

      <KitBlock title="Counter">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => setCount((value) => value - 1)}>
            −1
          </Button>
          <Counter value={count} className="type-heading" />
          <Button variant="secondary" size="sm" onClick={() => setCount((value) => value + 1)}>
            +1
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCount((value) => value + 12000)}>
            +12K
          </Button>
        </div>
      </KitBlock>

      <KitBlock title="Loading" note="Skeletons breathe. No shimmer, no gradients.">
        <div className="grid gap-6 md:grid-cols-2">
          <PostSkeleton />
          <ListSkeleton rows={3} label="Loading people" />
        </div>
      </KitBlock>

      <KitBlock title="Empty states" note="Deflated objects: waiting for breath, not broken.">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-card border border-line bg-surface">
            <EmptyState compact titleAs="h3" object="bubble-deflated" title="Nothing here yet" body="Follow a few people and the wall fills up." action={{ label: "Find people", to: "/__kit" }} />
          </div>
          <div className="rounded-card border border-line bg-surface">
            <EmptyState compact titleAs="h3" object="bell-deflated" title="All quiet" body="Likes, comments and follows land here." />
          </div>
          <div className="rounded-card border border-line bg-surface">
            <EmptyState compact titleAs="h3" object="bookmark-deflated" title="No saved posts" body="Save a post and it sticks here." />
          </div>
        </div>
      </KitBlock>

      <KitBlock title="Error states">
        <ErrorState level="inline" message="Couldn’t load replies." onRetry={() => undefined} />
        <ErrorState message="The wall didn’t load. Check your connection and try again." onRetry={() => undefined} />
        <div className="rounded-card border border-line">
          <ErrorState level="page" message="The page you’re looking for isn’t here any more." onRetry={() => undefined} retryLabel="Back to the wall" />
        </div>
      </KitBlock>

      <KitBlock title="Marquee">
        <Marquee items={["Aura — from the Greek αὔρα, breath", "Everything here breathes", "Paper. Outline. Inflate."]} />
      </KitBlock>
    </div>
  );
}
