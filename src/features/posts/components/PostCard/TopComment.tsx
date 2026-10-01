import { Link } from "react-router";
import { Avatar } from "@/shared/kit/Avatar";
import { formatCount } from "@/shared/kit/format";
import { routes } from "@/app/router/routes";
import type { PostTopComment } from "../../model/post.types";

/** The comment worth reading first, under a post on the wall. */
export function TopComment({ postId, comment, total }: { postId: string; comment: PostTopComment; total: number }) {
  return (
    <div className="flex items-start gap-3 rounded-chip bg-surface-2 p-3.5">
      <Avatar identityKey={comment.authorName} name={comment.authorName} photo={comment.authorPhoto} size="sm" frame={false} />
      <div className="grid min-w-0 flex-1 gap-1">
        <p className="line-clamp-3 wrap-anywhere type-body">
          <span className="font-bold">{comment.authorName}</span> <span className="text-ink-2">{comment.content}</span>
        </p>
        <Link
          to={`${routes.postDetails(postId)}?showComments=1`}
          viewTransition
          className="justify-self-start type-caption font-bold underline decoration-1 underline-offset-4"
        >
          {total > 1 ? `See all ${formatCount(total)} comments` : "Reply"}
        </Link>
      </div>
    </div>
  );
}
