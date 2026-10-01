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
