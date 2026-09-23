import { useRef, type ChangeEvent } from "react";
import { identityFor } from "@/shared/brand/identity";
import { shapePath } from "@/shared/brand/shapes";
import { Button } from "@/shared/kit/Button";
import { Menu, type MenuItem, type MenuTriggerProps } from "@/shared/kit/Menu";

/** Paper stickers of the person's own shape, stuck across their colour. */
const STAMPS = [
  { x: 1010, y: 150, scale: 3.2, rotate: 12 },
  { x: 170, y: 250, scale: 1.7, rotate: -18 },
  { x: 610, y: 36, scale: 1.05, rotate: 28 },
];

function CoverTrigger({ label, ...props }: MenuTriggerProps) {
  return (
    <Button variant="secondary" size="sm" iconStart="camera" aria-label={label} {...props}>
      Cover
    </Button>
  );
}

interface ProfileCoverProps {
  identityKey: string;
  name: string;
  coverUrl: string;
  canEdit: boolean;
  isUpdating: boolean;
  onView: () => void;
  onSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

/** The band across the top of a profile: their cover, or their own colour stuck with their own shape. */
export function ProfileCover({ identityKey, name, coverUrl, canEdit, isUpdating, onView, onSelect, onRemove }: ProfileCoverProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const identity = identityFor(identityKey);
  const path = shapePath(identity.shape, 46, identity.seed);

  const pick: MenuItem = {
    label: coverUrl ? "Change cover" : "Add a cover",
    glyph: "camera",
    disabled: isUpdating,
    onSelect: () => fileRef.current?.click(),
  };
  const items: MenuItem[] = coverUrl
    ? [
        pick,
        { label: "View cover", glyph: "image", onSelect: onView },
        { label: "Remove cover", glyph: "trash", tone: "danger", disabled: isUpdating, onSelect: onRemove },
      ]
    : [pick];

  return (
    <div className="relative">
      <div
        className="relative h-40 overflow-hidden rounded-card-lg border border-line sm:h-56 lg:h-72"
        style={{ background: identity.color.hex }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <svg aria-hidden viewBox="0 0 1200 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
            {STAMPS.map((stamp) => (
              <path
                key={stamp.x}
                d={path}
                transform={`translate(${stamp.x} ${stamp.y}) rotate(${stamp.rotate + identity.tilt}) scale(${stamp.scale})`}
                style={{ fill: "var(--paper)", fillOpacity: 0.3, stroke: "var(--carbon)", strokeOpacity: 0.55 }}
                strokeWidth={1.5}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        )}
        {!canEdit && coverUrl ? (
          <button type="button" onClick={onView} aria-label={`View ${name}’s cover`} className="absolute inset-0 cursor-zoom-in" />
        ) : null}
        {isUpdating ? (
          <span role="status" className="absolute bottom-3 left-3 rounded-pill border border-carbon bg-paper px-3 py-1.5 type-label text-carbon">
            Uploading cover…
          </span>
        ) : null}
      </div>

      {canEdit ? (
        <div className="absolute top-3 right-3">
          <input ref={fileRef} type="file" accept="image/*" tabIndex={-1} aria-hidden className="sr-only" onChange={onSelect} />
          <Menu label="Cover options" items={items} trigger={CoverTrigger} />
        </div>
      ) : null}
    </div>
  );
}
