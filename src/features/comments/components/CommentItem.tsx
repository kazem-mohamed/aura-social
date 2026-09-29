import { useMemo, useRef, useState } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { useRefocusOnClose } from "@/shared/hooks/useRefocusOnClose";
import { queryKeys } from "@/shared/api/queryKeys";
import { isSameEntity } from "@/shared/lib/values";
import { LikeButton } from "@/shared/kit/ActionButtons";
import { Button } from "@/shared/kit/Button";
import { ConfirmDialog } from "@/shared/kit/ConfirmDialog";
import type { MenuItem } from "@/shared/kit/Menu";
import { useToast } from "@/shared/kit/toast/useToast";
import { useCreateComment, useDeleteComment, useToggleCommentLike, useUpdateComment } from "../hooks/useCommentMutations";
import { useReplies } from "../hooks/useCommentQueries";
import { flattenComments, readTotalCount } from "../model/comment.cache";
import type { Comment } from "../model/comment.types";
import { CommentComposer } from "./CommentComposer";
import { CommentEditForm } from "./CommentEditForm";
import { CommentRow } from "./CommentRow";
import { ReplyList } from "./ReplyList";

interface CommentItemProps {
  postId: string;
  comment: Comment;
  meId: string | null;
  meName: string;
}

/**
 * One comment with its like, its replies and its owner's actions. Replies
 * load only once the thread is opened, so a page of comments doesn't fire a
 * request for each.
 */
export function CommentItem({ postId, comment, meId, meName }: CommentItemProps) {
  const toast = useToast();
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  useRefocusOnClose(isEditing, rowRef, '[aria-label="Comment options"]');
  useRefocusOnClose(isReplying, rowRef, "[data-reply-toggle]");

  const like = useToggleCommentLike(postId, comment, queryKeys.comments.list(postId));
  const update = useUpdateComment(postId, comment.id);
  const remove = useDeleteComment(postId, comment.id);
  const reply = useCreateComment(postId, "reply", comment.id, meName);

  const repliesQuery = useReplies(postId, comment.id, showReplies);
  const replies = useMemo(() => flattenComments(repliesQuery.data), [repliesQuery.data]);
  const repliesCount = readTotalCount(repliesQuery.data, comment.repliesCount || replies.length);

  const fail = (error: unknown, fallback: string) =>
    toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(error, fallback) });

  const menu: MenuItem[] =
    isSameEntity(comment.authorId, meId) && !comment.isOptimistic && !isEditing
      ? [
          { label: "Edit comment", glyph: "edit", onSelect: () => setIsEditing(true) },
          { label: "Delete comment", glyph: "trash", tone: "danger", onSelect: () => setIsDeleting(true) },
        ]
      : [];

  const sendReply = async (content: string) => {
    setShowReplies(true);
    try {
      await reply.mutateAsync(content);
      setIsReplying(false);
      return true;
    } catch (error) {
      fail(error, "Your reply didn’t post. Try again.");
      return false;
    }
  };

  // mutateAsync for the edit and the delete: the optimistic cache update can
  // unmount this comment before the request settles, and a failure must still
  // be reported.
  const saveEdit = async (content: string) => {
    try {
      await update.mutateAsync(content);
      setIsEditing(false);
    } catch (error) {
      fail(error, "Your edit didn’t save. Try again.");
    }
  };

  const confirmDelete = async () => {
    try {
      await remove.mutateAsync();
      setIsDeleting(false);
    } catch (error) {
      fail(error, "The comment is still there. Try again.");
    }
  };

  return (
    <CommentRow ref={rowRef} comment={comment} menu={menu}>
      {isEditing ? (
        <CommentEditForm
          initialContent={comment.content}
          saving={update.isPending}
          onCancel={() => setIsEditing(false)}
          onSave={(content) => void saveEdit(content)}
        />
      ) : comment.content ? (
        <p className="wrap-anywhere whitespace-pre-wrap type-body">{comment.content}</p>
      ) : null}

      <div className="-ml-2.5 flex flex-wrap items-center gap-1">
        <LikeButton
          size="sm"
          label="Like comment"
          liked={comment.isLiked}
          count={comment.likesCount}
          disabled={comment.isOptimistic}
          onToggle={() => {
            if (like.isPending) return;
            like.mutate(undefined, { onError: (error) => fail(error, "Your like didn’t save. Try again.") });
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={comment.isOptimistic}
          aria-expanded={isReplying}
          data-reply-toggle
          onClick={() => setIsReplying((open) => !open)}
        >
          Reply
        </Button>
        {repliesCount > 0 || showReplies ? (
          <Button variant="ghost" size="sm" aria-expanded={showReplies} onClick={() => setShowReplies((open) => !open)}>
            {showReplies ? "Hide replies" : `${repliesCount} ${repliesCount === 1 ? "reply" : "replies"}`}
          </Button>
        ) : null}
      </div>

      {isReplying ? (
        <CommentComposer
          label="Write a reply"
          placeholder={`Reply to ${comment.authorName}`}
          submitLabel="Reply"
          autoFocus
          pending={reply.isPending}
          onSubmit={sendReply}
          onCancel={() => setIsReplying(false)}
        />
      ) : null}

      {showReplies ? (
        <ReplyList
          postId={postId}
          parentId={comment.id}
          replies={replies}
          isLoading={repliesQuery.isLoading}
          error={repliesQuery.error}
          hasNextPage={repliesQuery.hasNextPage}
          isFetchingNextPage={repliesQuery.isFetchingNextPage}
          onLoadMore={() => void repliesQuery.fetchNextPage()}
          onRetry={() => void repliesQuery.refetch()}
        />
      ) : null}

      <ConfirmDialog
        open={isDeleting}
        onClose={() => {
          if (!remove.isPending) setIsDeleting(false);
        }}
        onConfirm={() => void confirmDelete()}
        title="Delete this comment?"
        description="It disappears for everyone."
        confirmLabel="Delete comment"
        destructive
        loading={remove.isPending}
      />
    </CommentRow>
  );
}
