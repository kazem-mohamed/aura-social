import { Link } from "react-router";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { FollowButton } from "@/shared/kit/ActionButtons";
import { Avatar } from "@/shared/kit/Avatar";
import { Card } from "@/shared/kit/Card";
import { Counter } from "@/shared/kit/Counter";
import { Skeleton } from "@/shared/kit/Skeleton";
import { routes } from "@/app/router/routes";
import type { DiscoveredUser } from "../model/user.types";

/** A row on phones (a list you can scan), a centred sticker card from `sm` up (a wall). */
const LAYOUT =
  "flex items-center gap-3 p-4 text-left sm:grid sm:h-full sm:content-start sm:justify-items-center sm:gap-3 sm:p-6 sm:text-center";

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
  // The phone row gives the name the room; the card from `sm` up gives the sticker the room.
  const isCard = useMediaQuery("(min-width: 640px)");

  return (
    <Card variant="media" className={LAYOUT}>
      <Link to={href} viewTransition tabIndex={-1} aria-hidden className="shrink-0 rounded-full">
        <Avatar identityKey={user.username} name={user.name} photo={user.photo} size={isCard ? "lg" : "md"} />
      </Link>
      <div className="grid min-w-0 flex-1 gap-0.5 sm:w-full sm:flex-none">
        <Link
          to={href}
          viewTransition
          className="line-clamp-2 text-[17px] leading-tight font-bold wrap-anywhere hover:underline hover:decoration-1 hover:underline-offset-4 sm:line-clamp-1"
        >
          {user.name}
        </Link>
        <p className="truncate type-caption text-ink-2">@{user.username}</p>
        <p className="type-caption text-ink-2">
          <Counter value={followers} className="font-bold text-ink" /> {followers === 1 ? "follower" : "followers"}
        </p>
      </div>
      <FollowButton size="sm" name={user.name} following={following} pending={pending} onToggle={onToggleFollow} />
    </Card>
  );
}

/** The loading shape of a person card. */
export function PersonCardSkeleton() {
  return (
    <div aria-hidden className={`rounded-card border border-line bg-surface ${LAYOUT}`}>
      <Skeleton shape="circle" className="h-16 w-16 shrink-0" />
      <div className="grid flex-1 gap-2 sm:w-full sm:flex-none sm:justify-items-center">
        <Skeleton className="w-28" />
        <Skeleton className="w-36" />
      </div>
      <Skeleton className="w-28 shrink-0" style={{ height: 36 }} />
    </div>
  );
}
