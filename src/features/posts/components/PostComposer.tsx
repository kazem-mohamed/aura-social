import { useRef, useState, type FormEvent } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { MAX_POST_BODY_LENGTH } from "@/shared/config/constants";
import { useImagePreview } from "@/shared/hooks/useImagePreview";
import { Avatar } from "@/shared/kit/Avatar";
import { Button } from "@/shared/kit/Button";
import { cx } from "@/shared/kit/cx";
import { IconButton } from "@/shared/kit/IconButton";
import { TextArea } from "@/shared/kit/TextArea";
import { useToast } from "@/shared/kit/toast/useToast";
import { useCurrentUser } from "@/features/users/hooks/useCurrentUser";
import { useCreatePost } from "../hooks/usePostMutations";
import { postDraftSchema } from "../model/post.schemas";

interface PostComposerProps {
  /** Called after a successful post — the sheet closes itself with it. */
  onPosted?: () => void;
  autoFocus?: boolean;
  className?: string;
}

/** Write a post: text, one image, or both. Your identity sticker signs it before you do. */
export function PostComposer({ onPosted, autoFocus = false, className }: PostComposerProps) {
  const { data: me } = useCurrentUser();
  const createPost = useCreatePost();
  const image = useImagePreview();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();

  const canPost = body.trim().length > 0 || image.file !== null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const draft = postDraftSchema.safeParse({ body, imageFile: image.file });
    if (!draft.success) {
      setError(draft.error.issues[0]?.message ?? "This post can’t be sent yet.");
      return;
    }
    setError(undefined);
    createPost.mutate(
      { body: draft.data.body ?? "", imageFile: draft.data.imageFile ?? null },
      {
        onSuccess: () => {
          setBody("");
          image.clear();
          toast.show({ title: "Posted. It’s on the wall." });
          onPosted?.();
        },
        onError: (failure) => setError(getErrorMessage(failure, "That didn’t stick. Try posting again.")),
      },
    );
  };

  return (
    <form onSubmit={submit} aria-label="New post" className={cx("grid gap-4", className)}>
      <div className="flex items-start gap-3">
        <Avatar identityKey={me?.handle ?? "you"} name={me?.name ?? "You"} photo={me?.photo} size="md" className="mt-1" />
        <TextArea
          label="Write a post"
          hideLabel
          className="min-w-0 flex-1"
          placeholder="Say it out loud."
          value={body}
          maxLength={MAX_POST_BODY_LENGTH}
          counter="near"
          autoFocus={autoFocus}
          error={error}
          onChange={(event) => {
            setBody(event.target.value);
            if (error) setError(undefined);
          }}
        />
      </div>

      {image.previewUrl ? (
        <figure className="relative overflow-hidden rounded-card border border-line sm:ml-[52px]">
          <img src={image.previewUrl} alt="Image to post" className="block max-h-80 w-full object-cover" />
          <IconButton glyph="close" label="Remove image" size="sm" className="absolute top-2 right-2" onClick={image.clear} />
        </figure>
      ) : null}

      <div className="flex items-center gap-2 sm:pl-[52px]">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          tabIndex={-1}
          aria-hidden
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            image.select(file);
            setError(undefined);
          }}
        />
        <Button variant="ghost" size="sm" iconStart="image" onClick={() => fileRef.current?.click()}>
          {image.file ? "Change image" : "Add image"}
        </Button>
        <Button type="submit" className="ml-auto" disabled={!canPost} loading={createPost.isPending}>
          Post
        </Button>
      </div>
    </form>
  );
}
