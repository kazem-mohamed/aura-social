import type { MouseEvent } from "react";
import { cx } from "@/shared/kit/cx";
import type { Post } from "../../model/post.types";

interface PostBodyProps {
  post: Post;
  variant: "feed" | "detail";
  /** Feed cards open the post when the words or the picture are clicked. */
  onOpen?: () => void;
}

/** The words, then the picture. A short post with nothing else is set large — the words are the whole post. */
export function PostBody({ post, variant, onOpen }: PostBodyProps) {
  // A share that carries the original's image shows it once, in the quote.
  const image = post.image && post.image !== post.sharedPost?.image ? post.image : null;
  if (!post.body && !image) return null;

  const isShout = !image && !post.sharedPost && post.body.length <= 140;

  const open = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    // Portalled dialogs bubble through React too; ignore anything outside this
    // block, anything interactive, and clicks that finish a text selection.
    if (!event.currentTarget.contains(target) || target.closest("a, button")) return;
    if (window.getSelection()?.toString()) return;
    onOpen?.();
  };

  return (
    <div onClick={onOpen ? open : undefined} className={cx("grid gap-4", onOpen && "cursor-pointer")}>
      {post.body ? (
        <p
          className={cx(
            "wrap-anywhere whitespace-pre-wrap",
            isShout ? "type-heading-sm" : "type-body-lg",
            variant === "feed" && "line-clamp-[14]",
          )}
        >
          {post.body}
        </p>
      ) : null}
      {image ? (
        <div className="overflow-hidden rounded-chip border border-line bg-surface-2">
          <img
            src={image}
            // The API carries no description; saying whose image it is beats silence.
            alt={`Image posted by ${post.author.name}`}
            loading={variant === "detail" ? "eager" : "lazy"}
            decoding="async"
            className={cx("block w-full object-cover", variant === "feed" && "max-h-[560px]")}
            style={{ viewTransitionName: `post-${post.id}` }}
          />
        </div>
      ) : null}
    </div>
  );
}
