import { PostCard } from "@/features/posts/components/PostCard";
import type { Post } from "@/features/posts/model/post.types";
import { KitBlock } from "./KitBlock";

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

/** Sample post cards. Their buttons call the real API — look, don't press. */
export function PostsSection() {
  return (
    <div className="grid gap-16" id="posts">
      <h2 className="type-display">Posts</h2>
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
