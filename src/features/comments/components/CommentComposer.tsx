import { useState, type FormEvent, type ReactNode, type Ref } from "react";
import { MAX_COMMENT_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { TextArea } from "@/shared/kit/TextArea";

interface CommentComposerProps {
  label: string;
  placeholder: string;
  submitLabel: string;
  pending: boolean;
  /** Resolves `true` once the text is accepted — only then does the box empty. */
  onSubmit: (content: string) => Promise<boolean>;
  onCancel?: () => void;
  autoFocus?: boolean;
  /** Shown before the box: the writer's avatar. */
  lead?: ReactNode;
  ref?: Ref<HTMLTextAreaElement>;
}

/** A comment or reply box. Ctrl/⌘ + Enter sends. */
export function CommentComposer({ label, placeholder, submitLabel, pending, onSubmit, onCancel, autoFocus, lead, ref }: CommentComposerProps) {
  const [content, setContent] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || pending) return;
    if (await onSubmit(trimmed)) setContent("");
  };

  return (
    <form aria-label={label} onSubmit={(event) => void submit(event)} className="flex items-start gap-3">
      {lead}
      <div className="grid min-w-0 flex-1 gap-2">
        <TextArea
          ref={ref}
          label={label}
          hideLabel
          rows={1}
          placeholder={placeholder}
          value={content}
          readOnly={pending}
          autoFocus={autoFocus}
          maxLength={MAX_COMMENT_LENGTH}
          counter="near"
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" size="sm" iconStart="send" loading={pending} disabled={!content.trim()}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
