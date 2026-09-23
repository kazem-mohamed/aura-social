import { useMemo, useState, type Ref } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { Avatar } from "@/shared/kit/Avatar";
import { Button } from "@/shared/kit/Button";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { Segmented } from "@/shared/kit/Segmented";
import { ListSkeleton } from "@/shared/kit/Skeleton";
import { useToast } from "@/shared/kit/toast/useToast";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { useCreateComment } from "../hooks/useCommentMutations";
import { useComments } from "../hooks/useCommentQueries";
import { flattenComments, readTotalCount } from "../model/comment.cache";
import { CommentComposer } from "./CommentComposer";
import { CommentItem } from "./CommentItem";

type SortOrder = "top" | "newest";

const SORT_OPTIONS = [
  { value: "top" as const, label: "Top" },
  { value: "newest" as const, label: "Newest" },
];

interface CommentsSectionProps {
  postId: string;
  /** The post page focuses this box when its comment button is pressed. */
  composerRef?: Ref<HTMLTextAreaElement>;
  autoFocus?: boolean;
}

/** The conversation under a post: a box to write in, then every comment and its thread. */
export function CommentsSection({ postId, composerRef, autoFocus }: CommentsSectionProps) {
  const { data: me } = useCurrentUser();
  const toast = useToast();
  const [sort, setSort] = useState<SortOrder>("top");

  const commentsQuery = useComments(postId);
  const create = useCreateComment(postId, "comment", null, me?.name ?? "You");

  const comments = useMemo(() => flattenComments(commentsQuery.data), [commentsQuery.data]);
  const sorted = useMemo(() => {
    if (sort !== "newest") return comments;
    return [...comments].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }, [comments, sort]);

  const total = readTotalCount(commentsQuery.data, sorted.length);
  const isReady = !commentsQuery.isLoading && !commentsQuery.error;

  const send = async (content: string) => {
    try {
      await create.mutateAsync(content);
      return true;
    } catch (error) {
      toast.show({ tone: "error", title: "Your comment didn’t post", description: getErrorMessage(error, "Try sending it again.") });
      return false;
    }
  };

  return (
    <section id="comments" aria-labelledby="comments-title" className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="comments-title" className="type-heading">
          Comments <span className="text-ink-3 tnum">{total}</span>
        </h2>
        {sorted.length > 1 ? <Segmented size="sm" label="Sort comments" options={SORT_OPTIONS} value={sort} onChange={setSort} /> : null}
      </div>

      <CommentComposer
        ref={composerRef}
        label="Write a comment"
        placeholder="Add to the conversation"
        submitLabel="Comment"
        autoFocus={autoFocus}
        pending={create.isPending}
        onSubmit={send}
        lead={<Avatar identityKey={me?.handle ?? "you"} name={me?.name ?? "You"} photo={me?.photo} size="sm" className="mt-1.5" />}
      />

      {commentsQuery.isLoading ? <ListSkeleton rows={3} label="Loading comments" /> : null}
      {!commentsQuery.isLoading && commentsQuery.error ? (
        <ErrorState
          message={getErrorMessage(commentsQuery.error, "The comments didn’t load. Check your connection and try again.")}
          onRetry={() => void commentsQuery.refetch()}
        />
      ) : null}
      {isReady && sorted.length === 0 ? (
        <EmptyState compact titleAs="h3" object="bubble-deflated" title="No comments yet." body="Say the first thing." />
      ) : null}
      {isReady && sorted.length > 0 ? (
        <ol className="grid gap-6">
          {sorted.map((comment) => (
            <li key={comment.id}>
              <CommentItem postId={postId} comment={comment} meId={me?.id ?? null} meName={me?.name ?? "You"} />
            </li>
          ))}
        </ol>
      ) : null}
      {isReady && commentsQuery.hasNextPage ? (
        <Button
          variant="secondary"
          className="justify-self-center"
          loading={commentsQuery.isFetchingNextPage}
          onClick={() => void commentsQuery.fetchNextPage()}
        >
          More comments
        </Button>
      ) : null}
    </section>
  );
}
