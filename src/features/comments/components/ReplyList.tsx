import { getErrorMessage } from "@/shared/api/errors";
import { queryKeys } from "@/shared/api/queryKeys";
import { LikeButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { ErrorState } from "@/shared/kit/ErrorState";
import { ListSkeleton } from "@/shared/kit/Skeleton";
import { useToast } from "@/shared/kit/toast/useToast";
import { useToggleCommentLike } from "../hooks/useCommentMutations";
import type { Comment } from "../model/comment.types";
import { CommentRow } from "./CommentRow";

function ReplyItem({ postId, parentId, reply }: { postId: string; parentId: string; reply: Comment }) {
  const toast = useToast();
  const like = useToggleCommentLike(postId, reply, queryKeys.comments.replies(postId, parentId));

  return (
    <CommentRow comment={reply}>
      {reply.content ? <p className="break-words whitespace-pre-wrap type-body">{reply.content}</p> : null}
      <div className="-ml-2.5">
        <LikeButton
          size="sm"
          label="Like reply"
          liked={reply.isLiked}
          count={reply.likesCount}
          disabled={reply.isOptimistic}
          onToggle={() => {
            if (like.isPending) return;
            like.mutate(undefined, {
              onError: (error) =>
                toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(error, "Your like didn’t save. Try again.") }),
            });
          }}
        />
      </div>
    </CommentRow>
  );
}

interface ReplyListProps {
  postId: string;
  parentId: string;
  replies: Comment[];
  isLoading: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
}

/** Replies hang one step in, behind a rule. */
export function ReplyList({ postId, parentId, replies, isLoading, error, hasNextPage, isFetchingNextPage, onLoadMore, onRetry }: ReplyListProps) {
  const isReady = !isLoading && !error;

  return (
    <div className="mt-1 grid gap-4 border-l border-line pl-4">
      {isLoading ? <ListSkeleton rows={1} label="Loading replies" /> : null}
      {!isLoading && error ? (
        <ErrorState level="inline" message={getErrorMessage(error, "The replies didn’t load.")} onRetry={onRetry} />
      ) : null}
      {isReady && replies.length === 0 ? <p className="type-caption text-ink-2">No replies yet.</p> : null}
      {isReady ? replies.map((reply) => <ReplyItem key={reply.id} postId={postId} parentId={parentId} reply={reply} />) : null}
      {isReady && hasNextPage ? (
        <Button variant="ghost" size="sm" className="justify-self-start" loading={isFetchingNextPage} onClick={onLoadMore}>
          More replies
        </Button>
      ) : null}
    </div>
  );
}
