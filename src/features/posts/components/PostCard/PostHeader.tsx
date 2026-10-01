import { Link } from "react-router";
import { formatDateTime, formatRelativeShort } from "@/shared/lib/dates";
import { Avatar } from "@/shared/kit/Avatar";
import { Menu, type MenuItem } from "@/shared/kit/Menu";
import { routes } from "@/app/router/routes";
import type { Post } from "../../model/post.types";

/** Who posted it and when; the owner's menu on the right. */
export function PostHeader({ post, menu }: { post: Post; menu: MenuItem[] }) {
  const { author } = post;
  const profileHref = author.id ? routes.userProfile(author.id) : routes.profile;

  return (
    <header className="flex items-center gap-3">
      <Link to={profileHref} viewTransition tabIndex={-1} aria-hidden className="shrink-0 rounded-full">
        <Avatar identityKey={author.handle} name={author.name} photo={author.photo} />
      </Link>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <Link
          to={profileHref}
          viewTransition
          className="justify-self-start truncate text-[16px] leading-tight font-bold hover:underline hover:decoration-1 hover:underline-offset-4"
        >
          {author.name}
        </Link>
        <p className="flex min-w-0 items-center gap-1.5 type-caption text-ink-2">
          <span className="truncate">{author.handle}</span>
          <span aria-hidden>·</span>
          <Link
            to={routes.postDetails(post.id)}
            viewTransition
            aria-label={`Open post, posted ${formatDateTime(post.createdAt)}`}
            className="shrink-0 tnum hover:underline hover:underline-offset-4"
          >
            <time dateTime={post.createdAt ?? undefined}>{formatRelativeShort(post.createdAt)}</time>
          </Link>
        </p>
      </div>
      {menu.length > 0 ? <Menu label="Post options" items={menu} /> : null}
    </header>
  );
}
