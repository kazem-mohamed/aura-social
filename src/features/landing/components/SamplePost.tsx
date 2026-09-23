import { AnimatePresence, motion } from "framer-motion";
import { CommentButton, LikeButton, SaveButton, ShareButton } from "@/shared/kit/ActionButtons";
import { Avatar } from "@/shared/kit/Avatar";
import { spring } from "@/shared/motion/tokens";

interface SamplePostProps {
  liked: boolean;
  commented: boolean;
  saved: boolean;
  shared: boolean;
}

const noop = () => {};

/** The pinned demo post. Its state comes from the scroll, so its controls are inert. */
export function SamplePost({ liked, commented, saved, shared }: SamplePostProps) {
  return (
    <article aria-label="Sample post" className="relative grid gap-4 rounded-card border border-line bg-surface p-5 sm:p-6">
      <span className="absolute -top-3 left-5 rounded-pill border border-carbon bg-sun px-2.5 py-1 type-label text-carbon">Sample</span>
      <header className="flex items-center gap-3">
        <Avatar identityKey="mira.sol" name="Mira Sol" />
        <p className="grid gap-0.5">
          <span className="text-[16px] leading-tight font-bold">Mira Sol</span>
          <span className="type-caption text-ink-2">@mira.sol · 3m</span>
        </p>
      </header>
      <p className="type-heading-sm">First sticker on the wall. It’s mint, and it’s mine.</p>

      <div inert className="-mx-2.5 -mb-1.5 flex items-center gap-1">
        <LikeButton liked={liked} count={128 + (liked ? 1 : 0)} onToggle={noop} />
        <CommentButton count={14 + (commented ? 1 : 0)} onClick={noop} />
        <ShareButton count={3 + (shared ? 1 : 0)} onClick={noop} />
        <div className="ml-auto">
          <SaveButton saved={saved} onToggle={noop} />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {commented ? (
          <motion.div
            key="comment"
            className="flex items-start gap-3 rounded-chip bg-surface-2 p-3.5"
            initial={{ opacity: 0, y: -12, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={spring.release}
          >
            <Avatar identityKey="idris.okafor" name="Idris Okafor" size="sm" />
            <p className="type-body">
              <span className="font-bold">Idris Okafor</span> <span className="text-ink-2">Mint suits you. Mine came out ember.</span>
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {shared ? (
          <motion.p
            key="shared"
            className="justify-self-start rounded-pill border border-carbon bg-mint px-3.5 py-1.5 type-label text-carbon"
            initial={{ opacity: 0, y: 26, rotate: -7 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={spring.release}
          >
            Shared to your wall
          </motion.p>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
