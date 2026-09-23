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
