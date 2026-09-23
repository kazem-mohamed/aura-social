import type { ReactNode } from "react";
import { Link } from "react-router";
import { formatCommentTime, formatDateTime } from "@/shared/lib/dates";
import { Avatar } from "@/shared/kit/Avatar";
import { cx } from "@/shared/kit/cx";
import { Menu, type MenuItem } from "@/shared/kit/Menu";
import { routes } from "@/app/router/routes";
import type { Comment } from "../model/comment.types";

interface CommentRowProps {
  comment: Comment;
  /** Owner actions behind a "more" button. */
  menu?: MenuItem[];
  /** The words (or their editor), then the actions and any thread. */
  children: ReactNode;
}

/** Who said it and when, beside what they said. A comment still sending is dimmed and says so. */
export function CommentRow({ comment, menu = [], children }: CommentRowProps) {
  const nameClass = "text-[15px] font-bold text-ink";

  return (
    <div className={cx("flex items-start gap-3", comment.isOptimistic && "opacity-60")}>
      <Avatar
        identityKey={comment.authorHandle || comment.authorName}
        name={comment.authorName}
        photo={comment.authorPhoto}
        size="sm"
        className="mt-0.5"
      />
      <div className="grid min-w-0 flex-1 gap-1.5">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 type-caption text-ink-2">
            {comment.authorId ? (
              <Link
                to={routes.userProfile(comment.authorId)}
                viewTransition
                className={cx(nameClass, "hover:underline hover:decoration-1 hover:underline-offset-4")}
              >
                {comment.authorName}
              </Link>
            ) : (
              <span className={nameClass}>{comment.authorName}</span>
            )}{" "}
            {comment.authorHandle} <span aria-hidden>·</span>{" "}
            {comment.isOptimistic ? (
              <span>Sending…</span>
            ) : (
              <time dateTime={comment.createdAt ?? undefined} title={formatDateTime(comment.createdAt)} className="tnum">
                {formatCommentTime(comment.createdAt)}
              </time>
            )}
          </p>
          {menu.length > 0 ? <Menu label="Comment options" items={menu} className="-mt-1.5" /> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
