import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Glyph } from "@/shared/brand/Glyph";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { spring } from "@/shared/motion/tokens";
import { cx } from "../cx";
import type { ToastRecord, ToastTone } from "./toastContext";

const TONE_FILL: Record<ToastTone, string> = { success: "bg-mint", info: "bg-sky", warning: "bg-sun", error: "bg-ember" };
const TONE_ICON: Record<ToastTone, StickerName> = { success: "check", info: "info", warning: "bang", error: "cross" };

function ToastItem({ toast, onDismiss }: { toast: ToastRecord; onDismiss: (id: number) => void }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [paused, toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      role={toast.tone === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: 26, rotate: -7, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, transition: { duration: 0.22, ease: "easeIn" } }}
      transition={spring.arrive}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={cx(
        "pointer-events-auto flex w-max max-w-[min(92vw,480px)] items-center gap-3 rounded-pill border border-carbon py-2 pr-2 pl-2 text-carbon",
        TONE_FILL[toast.tone],
      )}
    >
      <Sticker name={TONE_ICON[toast.tone]} fill="var(--paper)" size={28} className="shrink-0" />
      <div className="min-w-0 flex-1 pr-1">
        <p className="leading-tight font-bold">{toast.title}</p>
        {toast.description ? <p className="type-caption">{toast.description}</p> : null}
      </div>
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.onClick();
            onDismiss(toast.id);
          }}
          className="shrink-0 rounded-pill border border-carbon bg-paper px-3 py-1.5 type-label text-carbon"
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => onDismiss(toast.id)}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-carbon/10"
      >
        <Glyph name="close" size={16} />
      </button>
    </motion.div>
  );
}

/** Where toasts land: bottom-centre, above the dock, newest last. */
export function ToastShelf({ toasts, onDismiss }: { toasts: ToastRecord[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+104px)] z-(--z-toast) grid justify-items-center gap-2 px-4"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
