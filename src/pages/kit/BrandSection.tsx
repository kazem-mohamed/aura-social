import { useState } from "react";
import { OBJECTS, type ObjectName } from "@/assets/objects/manifest";
import { Glyph } from "@/shared/brand/Glyph";
import { GLYPH_PATHS, type GlyphName } from "@/shared/brand/glyphPaths";
import { IdentitySticker } from "@/shared/brand/IdentitySticker";
import { Logo } from "@/shared/brand/Logo";
import { ObjectArt } from "@/shared/brand/ObjectArt";
import { PeelLoader } from "@/shared/brand/PeelLoader";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { KitBlock } from "./KitBlock";

const SWATCHES = [
  ["ground", "bg-ground"],
  ["surface", "bg-surface"],
  ["surface-2", "bg-surface-2"],
  ["band-sky", "bg-band-sky"],
  ["band-concrete", "bg-band-concrete"],
  ["band-lav", "bg-band-lav"],
  ["band-mist", "bg-band-mist"],
  ["ink", "bg-ink"],
  ["action", "bg-action"],
  ["blue", "bg-blue"],
  ["ember", "bg-ember"],
  ["sun", "bg-sun"],
  ["violet", "bg-violet"],
  ["mint", "bg-mint"],
  ["lavender", "bg-lavender"],
] as const;

const STICKERS: [StickerName, string][] = [
  ["bubble", "var(--blue)"],
  ["heart", "var(--ember)"],
  ["bookmark", "var(--sun)"],
  ["share", "var(--violet)"],
  ["bell", "var(--mint)"],
  ["sparkle", "var(--lavender)"],
  ["check", "var(--mint)"],
  ["cross", "var(--ember)"],
  ["bang", "var(--sun)"],
  ["info", "var(--sky)"],
];

const SAMPLE_HANDLES = ["leila.harb", "idris.okafor", "maya.s", "noor_ali", "sam.k", "yousef.dev"];

export function BrandSection() {
  const [slapKey, setSlapKey] = useState(0);

  return (
    <div className="grid gap-16">
      <h2 className="type-display">Brand</h2>

      <KitBlock title="Logo" note="Hover lifts the corner. Slap-in replays on demand. Primary, symbol, round, horizontal, one-colour.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid min-h-64 place-items-center rounded-card border border-line bg-band-sky p-8">
            <Logo key={slapKey} interactive slapIn className="w-full max-w-md" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid place-items-center rounded-card border border-line bg-surface p-4 sm:p-6">
              <Logo variant="symbol" interactive className="w-full max-w-28" />
            </div>
            <div className="grid place-items-center rounded-card border border-line bg-band-lav p-4 sm:p-6">
              <Logo variant="round" className="w-full max-w-32" />
            </div>
            <div className="grid place-items-center rounded-card border border-line bg-surface p-4 sm:p-6">
              <Logo variant="symbol" mono interactive className="w-full max-w-24" />
            </div>
            <div className="grid place-items-center rounded-card border border-line bg-band-concrete p-4 sm:p-6">
              <Logo variant="horizontal" interactive className="w-full max-w-44" />
            </div>
          </div>
        </div>
        <button type="button" onClick={() => setSlapKey((k) => k + 1)} className="justify-self-start rounded-pill border border-line bg-surface px-4 py-2 type-label">
          Replay slap-in
        </button>
      </KitBlock>

      <KitBlock title="Peel loader">
        <div className="flex items-end gap-6">
          <PeelLoader size={20} />
          <PeelLoader size={32} />
          <PeelLoader size={56} />
          <PeelLoader size={96} />
        </div>
      </KitBlock>

      <KitBlock title="Colour" note="Semantic tokens flip with the theme; sticker fills never do.">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
          {SWATCHES.map(([name, cls]) => (
            <div key={name} className="grid gap-2">
              <div className={`h-16 rounded-chip border border-line ${cls}`} />
              <span className="type-caption">{name}</span>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Type">
        <div className="grid gap-6">
          <p className="type-display-xl">Aura</p>
          <p className="type-poster">Wall</p>
          <p className="type-display">This one popped</p>
          <p className="type-heading">Everything here breathes.</p>
          <p className="type-heading-sm">Post details</p>
          <p className="max-w-[62ch] type-body-lg">A post is flat until someone breathes into it. A like inflates it, a comment gives it volume.</p>
          <p className="max-w-[62ch] type-body">Painted the balcony door sunflower yellow. The neighbours have opinions.</p>
          <p className="type-caption text-ink-2">2h · 14 likes · 3 comments</p>
          <p className="type-label">Follow · Save · Share</p>
          <p className="tnum type-heading-sm">0123456789</p>
        </div>
      </KitBlock>

      <KitBlock title="Stickers" note="Flat counterparts of the 3D objects. Night paper adds the bone die-cut edge.">
        <div className="flex flex-wrap items-end gap-6">
          {STICKERS.map(([name, fill]) => (
            <div key={name} className="grid justify-items-center gap-2">
              <Sticker name={name} fill={fill} size={64} outline={2} />
              <span className="type-caption">{name}</span>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Glyphs">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8 lg:grid-cols-12">
          {(Object.keys(GLYPH_PATHS) as GlyphName[]).map((name) => (
            <div key={name} className="grid justify-items-center gap-2 rounded-chip border border-line bg-surface p-3">
              <Glyph name={name} size={24} />
              <span className="type-caption text-ink-2">{name}</span>
            </div>
          ))}
        </div>
      </KitBlock>

      <KitBlock title="Identity sticker" note="Sample handles — demonstration only. Same handle, same sticker.">
        <div className="flex flex-wrap items-end gap-6">
          {SAMPLE_HANDLES.map((handle, i) => (
            <div key={handle} className="grid justify-items-center gap-2">
              <IdentitySticker identityKey={handle} name={handle} size={[32, 40, 64, 96, 128, 64][i]} />
              <span className="type-caption">@{handle}</span>
            </div>
          ))}
          <div className="grid justify-items-center gap-2">
            <IdentitySticker identityKey="broken.photo" name="Broken Photo" photo="data:image/png;base64,bm90LWFuLWltYWdl" size={64} />
            <span className="type-caption">photo fails → initials</span>
          </div>
        </div>
      </KitBlock>

      <KitBlock title="3D objects" note="AVIF → WebP → PNG, lazy, with intrinsic sizes.">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(Object.keys(OBJECTS) as ObjectName[]).map((name) => (
            <figure key={name} className="grid gap-2 rounded-card border border-line bg-band-sky p-4">
              <ObjectArt name={name} sizes="240px" />
              <figcaption className="type-caption">{name}</figcaption>
            </figure>
          ))}
        </div>
      </KitBlock>
    </div>
  );
}
