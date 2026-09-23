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
