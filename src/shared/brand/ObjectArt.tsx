import { useState } from "react";
import { OBJECTS, type ObjectName } from "@/assets/objects/manifest";
import { OBJECT_FALLBACKS } from "./objectFallbacks";
import { Sticker } from "./Sticker";

const FILES = import.meta.glob<string>("/src/assets/objects/*.{avif,webp,png}", {
  eager: true,
  query: "?url",
  import: "default",
});

const fileUrl = (name: ObjectName, width: 480 | 960, ext: "avif" | "webp" | "png") =>
  FILES[`/src/assets/objects/${name}-${width}.${ext}`];

export interface ObjectArtProps {
  name: ObjectName;
  /** `sizes` attribute — how wide the image renders. */
  sizes?: string;
  /** The landing hero's LCP object loads eagerly with high priority. */
  priority?: boolean;
  /** Empty for decorative objects (the default). */
  alt?: string;
  className?: string;
}

/**
 * One inflated 3D object (spec §5.4): AVIF, then WebP, then PNG, with its
 * intrinsic size declared so nothing shifts. If it fails to load, the flat
 * sticker of the same object takes its place.
 */
export function ObjectArt({ name, sizes = "(max-width: 640px) 60vw, 480px", priority = false, alt = "", className }: ObjectArtProps) {
  const [failed, setFailed] = useState(false);
  const { width, height } = OBJECTS[name];

  if (failed) {
    const fallback = OBJECT_FALLBACKS[name];
    return <Sticker name={fallback.sticker} fill={fallback.fill} outline={2} title={alt || undefined} className={className} />;
  }

  return (
    <picture className={className}>
      <source type="image/avif" srcSet={`${fileUrl(name, 480, "avif")} 480w, ${fileUrl(name, 960, "avif")} 960w`} sizes={sizes} />
      <source type="image/webp" srcSet={`${fileUrl(name, 480, "webp")} 480w, ${fileUrl(name, 960, "webp")} 960w`} sizes={sizes} />
      <img
        src={fileUrl(name, 480, "png")}
        width={width}
        height={height}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        draggable={false}
        onError={() => setFailed(true)}
        className="block h-auto w-full select-none"
      />
    </picture>
  );
}
