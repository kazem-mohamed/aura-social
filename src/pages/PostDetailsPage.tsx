import { useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { getErrorMessage } from "@/shared/api/errors";
import { Button } from "@/shared/kit/Button";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { PostSkeleton } from "@/shared/kit/Skeleton";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { routes } from "@/app/router/routes";
import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { PostCard } from "@/features/posts/components/PostCard";
import { usePost } from "@/features/posts/hooks/usePostsQueries";

/** One post and its whole conversation. Its image arrives from the wall as a shared element. */
export default function PostDetailsPage() {
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { reduced } = useMotionPrefs();
  const composerRef = useRef<HTMLTextAreaElement>(null);

  const { data: post, isLoading, error, refetch } = usePost(postId);

  // "default" is the key of the first entry in this tab — nothing to go back to.
  const back = () => (location.key === "default" ? navigate(routes.home, { viewTransition: true }) : navigate(-1));

  const focusComposer = () => {
    const box = composerRef.current;
    if (!box) return;
    box.focus({ preventScroll: true });
    box.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  };

  return (
    <div className="mx-auto grid max-w-(--reading) gap-8 pt-6 sm:pt-10">
      <Button variant="ghost" size="sm" iconStart="arrow-left" onClick={back} className="-ml-3.5 justify-self-start">
        Back
      </Button>

      {isLoading ? <PostSkeleton /> : null}

      {!isLoading && error ? (
        <ErrorState
          title="This post didn’t load"
          message={getErrorMessage(error, "Check your connection and try again.")}
          onRetry={() => void refetch()}
        />
      ) : null}

      {!isLoading && !error && !post ? (
        <EmptyState
          object="bubble-popped"
          title="This post popped."
          body="It may have been deleted, or the link is wrong."
          action={{ label: "Back to the wall", to: routes.home }}
        />
      ) : null}

      {post ? (
        <>
          <h1 className="sr-only">Post by {post.author.name}</h1>
          <PostCard
            post={post}
            variant="detail"
            onComment={focusComposer}
            onDeleted={() => navigate(routes.home, { replace: true, viewTransition: true })}
          />
          <CommentsSection postId={post.id} composerRef={composerRef} autoFocus={searchParams.get("showComments") === "1"} />
        </>
      ) : null}
    </div>
  );
}
