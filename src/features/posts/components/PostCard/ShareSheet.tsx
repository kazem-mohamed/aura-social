import { useState } from "react";
import { MAX_SHARE_CAPTION_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { Modal } from "@/shared/kit/Modal";
import { TextArea } from "@/shared/kit/TextArea";
import type { Post } from "../../model/post.types";
import { QuotedPost } from "./QuotedPost";

interface ShareSheetProps {
  open: boolean;
  /** Shown in the preview — the original when re-sharing a share. */
  post: Post;
  sharing: boolean;
  onClose: () => void;
  onShare: (caption: string) => void;
}

/** Share to your own wall, with an optional line on top. */
export function ShareSheet({ open, post, sharing, onClose, onShare }: ShareSheetProps) {
  const [caption, setCaption] = useState("");
  const [wasOpen, setWasOpen] = useState(open);

  // Every opening starts with an empty caption.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setCaption("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share to your wall"
      description="Add a line, or share it as it is."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={sharing}>
            Cancel
          </Button>
          <Button iconStart="send" loading={sharing} onClick={() => onShare(caption)}>
            Share
          </Button>
        </>
      }
    >
      <div className="grid gap-5">
        <TextArea
          label="Caption"
          hideLabel
          autoFocus
          placeholder="Why is it worth a look?"
          value={caption}
          readOnly={sharing}
          maxLength={MAX_SHARE_CAPTION_LENGTH}
          counter="near"
          onChange={(event) => setCaption(event.target.value)}
        />
        <QuotedPost post={post} />
      </div>
    </Modal>
  );
}
