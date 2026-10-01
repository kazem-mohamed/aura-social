import { useState } from "react";
import { MAX_POST_BODY_LENGTH } from "@/shared/config/constants";
import { Button } from "@/shared/kit/Button";
import { TextArea } from "@/shared/kit/TextArea";

interface PostEditFormProps {
  initialBody: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (body: string) => void;
}

/** Edits the words in place; the image stays as it is. */
export function PostEditForm({ initialBody, saving, onCancel, onSave }: PostEditFormProps) {
  const [body, setBody] = useState(initialBody);

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (body.trim()) onSave(body);
      }}
    >
      <TextArea
        label="Edit post"
        hideLabel
        autoFocus
        value={body}
        readOnly={saving}
        maxLength={MAX_POST_BODY_LENGTH}
        counter="near"
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving} disabled={!body.trim()}>
          Save
        </Button>
      </div>
    </form>
  );
}
