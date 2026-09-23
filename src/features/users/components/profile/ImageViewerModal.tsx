import { useState } from "react";
import { Modal } from "@/shared/kit/Modal";

interface ViewedImage {
  url: string;
  alt: string;
}

/** A photo or a cover at full size. */
export function ImageViewerModal({ image, onClose }: { image: ViewedImage | null; onClose: () => void }) {
  // Keep showing the last image while the sheet animates away.
  const [shown, setShown] = useState(image);
  if (image && image !== shown) setShown(image);

  return (
    <Modal open={image !== null} onClose={onClose} title={shown?.alt ?? "Image"} hideTitle size="lg">
      {shown ? (
        <img
          src={shown.url}
          alt={shown.alt}
          className="mx-auto block max-h-[70dvh] w-auto max-w-full rounded-chip border border-line object-contain"
        />
      ) : null}
    </Modal>
  );
}
