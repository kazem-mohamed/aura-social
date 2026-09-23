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
      {post.body ? <p className="line-clamp-6 wrap-anywhere whitespace-pre-wrap type-body">{post.body}</p> : null}
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
