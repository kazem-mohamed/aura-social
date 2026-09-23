import { getErrorMessage } from "@/shared/api/errors";
import { useToast } from "@/shared/kit/toast/useToast";
import {
  useDeletePost,
  useSharePost,
  useTogglePostBookmark,
  useTogglePostLike,
  useUpdatePost,
} from "../../hooks/usePostMutations";
import { useCanManagePost } from "../../hooks/usePostPermissions";
import type { Post } from "../../model/post.types";

/**
 * Everything a post card can do, with the toasts that report it. Counts live
 * in the query cache and move optimistically (see usePostMutations), so the
 * card itself only remembers which panel is open.
 */
export function usePostCardActions(post: Post) {
  const toast = useToast();
  const canManage = useCanManagePost(post);
  const likeMutation = useTogglePostLike(post);
  const bookmarkMutation = useTogglePostBookmark(post);
  const shareMutation = useSharePost(post);
  const updateMutation = useUpdatePost();
  const deleteMutation = useDeletePost();

  const fail = (error: unknown, fallback: string) =>
    toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(error, fallback) });

  return {
    canManage,
    isSharing: shareMutation.isPending,
    isSaving: updateMutation.isPending,
    isRemoving: deleteMutation.isPending,

    toggleLike() {
      if (likeMutation.isPending) return;
      likeMutation.mutate(undefined, { onError: (error) => fail(error, "Your like didn’t save. Try again.") });
    },

    toggleSave() {
      if (bookmarkMutation.isPending) return;
      const wasSaved = post.isBookmarked;
      bookmarkMutation.mutate(undefined, {
        onSuccess: () => toast.show({ title: wasSaved ? "Removed from Saved." : "Saved. Find it under Saved." }),
        onError: (error) => fail(error, "Your saved posts didn’t update. Try again."),
      });
    },

    share(caption: string, onDone: () => void) {
      if (shareMutation.isPending) return;
      shareMutation.mutate(caption, {
        onSuccess: () => {
          onDone();
          toast.show({ tone: "success", title: "Shared to your wall." });
        },
        onError: (error) => fail(error, "The share didn’t go through. Try again."),
      });
    },

    edit(body: string, onDone: () => void) {
      updateMutation.mutate(
        { postId: post.id, body, imageFile: null },
        {
          onSuccess: () => {
            onDone();
            toast.show({ title: "Post updated." });
          },
          onError: (error) => fail(error, "Your changes didn’t save. Try again."),
        },
      );
    },

    remove(onDone: () => void) {
      if (deleteMutation.isPending) return;
      deleteMutation.mutate(post.id, {
        onSuccess: () => {
          onDone();
          toast.show({ title: "Post deleted." });
        },
        onError: (error) => fail(error, "The post is still there. Try again."),
      });
    },
  };
}
