import { useRef, useState, type KeyboardEvent, type PointerEvent, type SyntheticEvent } from "react";
import { Button } from "@/shared/kit/Button";
import { Modal } from "@/shared/kit/Modal";
import { clamp, clampOffset, getCropScale, PROFILE_CROP_SIZE, type Offset, type Size } from "../../lib/imageCrop";

const NUDGE = 12;
const ARROWS: Record<string, Offset> = {
  ArrowLeft: { x: -NUDGE, y: 0 },
  ArrowRight: { x: NUDGE, y: 0 },
  ArrowUp: { x: 0, y: -NUDGE },
  ArrowDown: { x: 0, y: NUDGE },
};

interface ProfilePhotoEditorModalProps {
  /** The picked image as a data URL; empty while the editor is closed. */
  imageUrl: string;
  saving: boolean;
  onCancel: () => void;
  onSave: (zoom: number, offset: Offset) => void;
}

/**
 * Frame the new photo: drag it (or use the arrow keys) and zoom. The circle is
 * drawn at the crop's real size, so what you frame is exactly what is saved.
 */
export function ProfilePhotoEditorModal({ imageUrl, saving, onCancel, onSave }: ProfilePhotoEditorModalProps) {
  const [source, setSource] = useState(imageUrl);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [natural, setNatural] = useState<Size>({ width: 0, height: 0 });
  const drag = useRef({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  // A new image starts centred at 1×.
  if (imageUrl !== source) {
    setSource(imageUrl);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setNatural({ width: 0, height: 0 });
  }

  const scale = getCropScale(natural, zoom);
  const hasSize = natural.width > 0 && natural.height > 0;

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!hasSize) return;
    drag.current = { active: true, startX: event.clientX, startY: event.clientY, originX: offset.x, originY: offset.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const { startX, startY, originX, originY } = drag.current;
    setOffset(clampOffset({ x: originX + event.clientX - startX, y: originY + event.clientY - startY }, natural, zoom));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROWS[event.key];
    if (!step || !hasSize) return;
    event.preventDefault();
    setOffset((current) => clampOffset({ x: current.x + step.x, y: current.y + step.y }, natural, zoom));
  };

  const onLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    const size = { width: event.currentTarget.naturalWidth || 0, height: event.currentTarget.naturalHeight || 0 };
    setNatural(size);
    setOffset((current) => clampOffset(current, size, zoom));
  };

  return (
    <Modal
      open={Boolean(imageUrl)}
      onClose={onCancel}
      title="Frame your photo"
      description="Drag it into place, then zoom. The circle is what everyone sees."
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!hasSize} onClick={() => onSave(zoom, offset)}>
            Save photo
          </Button>
        </>
      }
    >
      <div className="grid justify-items-center gap-6">
        <div
          role="group"
          tabIndex={0}
          aria-label="Photo position. Drag it, or use the arrow keys."
          className="relative shrink-0 cursor-grab touch-none overflow-hidden rounded-full bg-surface-2 ring-2 ring-carbon outline-offset-4 active:cursor-grabbing"
          style={{ width: PROFILE_CROP_SIZE, height: PROFILE_CROP_SIZE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          {imageUrl ? (
            <img
              alt=""
              src={imageUrl}
              draggable={false}
              onLoad={onLoad}
              className="pointer-events-none absolute top-1/2 left-1/2 max-w-none select-none"
              style={{
                width: natural.width || PROFILE_CROP_SIZE,
                height: natural.height || PROFILE_CROP_SIZE,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
                transformOrigin: "center",
              }}
            />
          ) : null}
        </div>

        <label className="grid w-full max-w-[320px] gap-2">
          <span className="flex items-center justify-between type-label">
            <span>Zoom</span>
            <span className="text-ink-2 tnum">{zoom.toFixed(2)}×</span>
          </span>
          <input
            type="range"
            className="kit-range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={saving || !hasSize}
            onChange={(event) => {
              const next = clamp(Number(event.target.value) || 1, 1, 3);
              setZoom(next);
              setOffset((current) => clampOffset(current, natural, next));
            }}
          />
        </label>
      </div>
    </Modal>
  );
}
