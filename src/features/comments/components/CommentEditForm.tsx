import { useState } from "react";
import { MAX_COMMENT_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { TextArea } from "@/shared/kit/TextArea";

interface CommentEditFormProps {
  initialContent: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (content: string) => void;
}

export function CommentEditForm({ initialContent, saving, onCancel, onSave }: CommentEditFormProps) {
  const [content, setContent] = useState(initialContent);

  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (content.trim()) onSave(content.trim());
      }}
    >
      <TextArea
        label="Edit comment"
        hideLabel
        rows={1}
        autoFocus
        value={content}
        readOnly={saving}
        maxLength={MAX_COMMENT_LENGTH}
        counter="near"
        onChange={(event) => setContent(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving} disabled={!content.trim()}>
          Save
        </Button>
      </div>
    </form>
  );
}
