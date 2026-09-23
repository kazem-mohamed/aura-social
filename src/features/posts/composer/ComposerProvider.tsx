import { useMemo, useState, type ReactNode } from "react";
import { Modal } from "@/shared/kit/Modal";
import { PostComposer } from "../components/PostComposer";
import { ComposerContext, type ComposerApi } from "./composerContext";

/** Holds the new-post sheet the dock's Post button opens. */
export function ComposerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const api = useMemo<ComposerApi>(
    () => ({ isOpen, open: () => setIsOpen(true), close: () => setIsOpen(false) }),
    [isOpen],
  );

  return (
    <ComposerContext.Provider value={api}>
      {children}
      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="New post" description="Text, one image, or both.">
        <PostComposer autoFocus onPosted={() => setIsOpen(false)} />
      </Modal>
    </ComposerContext.Provider>
  );
}
