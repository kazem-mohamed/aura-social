import { CommentButton, LikeButton, SaveButton, ShareButton } from "@/shared/kit/ActionButtons";
import type { Post } from "../../model/post.types";

interface PostActionsProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
}

/** Like, comment and share on the left; save on its own at the right. */
export function PostActions({ post, onLike, onComment, onShare, onSave }: PostActionsProps) {
  return (
    <div className="-mx-2.5 -mb-1.5 flex items-center gap-1">
      <LikeButton liked={post.isLiked} count={post.likesCount} onToggle={onLike} />
      <CommentButton count={post.commentsCount} onClick={onComment} />
      <ShareButton count={post.sharesCount} onClick={onShare} />
      <div className="ml-auto">
        <SaveButton saved={post.isBookmarked} onToggle={onSave} label="Save post" />
      </div>
    </div>
  );
}
