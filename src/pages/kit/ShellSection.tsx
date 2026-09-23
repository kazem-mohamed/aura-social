import { useState } from "react";
import { Button } from "@/shared/kit/Button";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import { Toggle } from "@/shared/kit/Toggle";
import { Dock } from "@/layouts/components/Dock";
import { ComposerProvider } from "@/features/posts/composer/ComposerProvider";
import { KitBlock } from "./KitBlock";

/** The member shell's pieces, previewable without a session. */
export function ShellSection() {
  const [showDock, setShowDock] = useState(true);

  return (
    <div className="grid gap-16" id="shell">
      <h2 className="type-display">Shell</h2>

      <KitBlock title="Poster header" note="The page's h1 — one line, always; it shrinks to fit instead of wrapping.">
        <div className="rounded-card border border-line px-4 sm:px-8">
          <PosterHeader
            title="Alerts"
            lede="Likes, comments, shares and follows."
            actions={
              <Button variant="secondary" size="sm" iconStart="check">
                Mark all read
              </Button>
            }
          />
        </div>
        <div className="rounded-card border border-line px-4 sm:px-8">
          <PosterHeader size="xl" title="Idris Okafor" eyebrow="@idris.okafor · sample" />
        </div>
      </KitBlock>

      <KitBlock title="Dock" note="Fixed to the bottom of this page while shown. The + opens the composer sheet.">
        <Toggle checked={showDock} onChange={setShowDock} label="Show the dock" />
      </KitBlock>

      {showDock ? (
        <ComposerProvider>
          <Dock />
        </ComposerProvider>
      ) : null}
    </div>
  );
}
