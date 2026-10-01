import { useState } from "react";
import { DEFAULT_PROFILE_IMAGE } from "@/shared/config/constants";
import { identityFor, initialsFor } from "./identity";
import { shapePath } from "./shapes";

export interface IdentityStickerProps {
  /** Handle (preferred) or id — the hash input. */
  identityKey: string;
  /** Display name, for initials. */
  name: string;
  photo?: string | null;
  /** Pixel size of the whole sticker. */
  size: number;
  /** Draw the identity frame behind the photo. */
  frame?: boolean;
  /** Accessible name; omit when the name is shown next to it. */
  label?: string;
  className?: string;
}

/**
 * A person's identity sticker: their deterministic colour and shape behind
 * their photo, or behind their initials when there is no photo — spec §5.2.
 * The initials render first and the photo fades in over them once decoded.
 */
export function IdentitySticker({ identityKey, name, photo, size, frame = true, label, className }: IdentityStickerProps) {
  const identity = identityFor(identityKey);
  const path = shapePath(identity.shape, 46, identity.seed);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const src = photo && photo !== DEFAULT_PROFILE_IMAGE ? photo : null;
  const showPhoto = src !== null && failedSrc !== src;
  const ratio = frame ? (size < 48 ? 0.72 : 0.66) : 1;
  const inner = Math.round(size * ratio);

  return (
    <span
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ position: "relative", display: "inline-grid", placeItems: "center", width: size, height: size, flexShrink: 0 }}
    >
      {frame ? (
        <svg
          viewBox="-50 -50 100 100"
          overflow="visible"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transform: `rotate(${identity.tilt}deg)` }}
        >
          <path d={path} style={{ fill: "var(--cut)", stroke: "var(--cut)" }} strokeWidth={8} strokeLinejoin="round" />
          <path
            d={path}
            style={{ fill: identity.color.hex, stroke: "var(--carbon)" }}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
      <span
        className="relative grid place-items-center overflow-hidden rounded-full border border-carbon bg-paper text-carbon"
        style={{ width: inner, height: inner }}
      >
        <span className="font-bold leading-none tracking-[-0.02em]" style={{ fontSize: Math.max(10, inner * 0.36) }}>
          {initialsFor(name)}
        </span>
        {showPhoto ? (
          <img
            key={src}
            src={src}
            alt=""
            decoding="async"
            loading="lazy"
            draggable={false}
            onLoad={() => setLoadedSrc(src)}
            onError={() => setFailedSrc(src)}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
            style={{ opacity: loadedSrc === src ? 1 : 0 }}
          />
        ) : null}
      </span>
    </span>
  );
}
