import { AnimatePresence, motion, useDragControls, useIsPresent } from "framer-motion";
import { useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useScrollLock } from "@/shared/hooks/useScrollLock";
import { useSafeId } from "@/shared/lib/useSafeId";
import { spring } from "@/shared/motion/tokens";
import { useMotionPrefs } from "@/shared/motion/useMotionPrefs";
import { cx } from "./cx";
import { IconButton } from "./IconButton";
import { useFocusTrap } from "./useFocusTrap";

const WIDTH = { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl" } as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  size?: keyof typeof WIDTH;
  hideTitle?: boolean;
  initialFocus?: RefObject<HTMLElement | null>;
  /** When false: no close button, no backdrop or Escape dismissal, no drag. */
  dismissible?: boolean;
}

/**
 * Dialog on tablets and desktops — it slaps in from a tilt. Bottom sheet on
 * phones — it slides up and can be dragged down to dismiss by its handle.
 */
export function Modal({ open, ...panel }: ModalProps) {
  return createPortal(<AnimatePresence>{open ? <ModalPanel key="modal" {...panel} /> : null}</AnimatePresence>, document.body);
}

function ModalPanel({
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideTitle = false,
  initialFocus,
  dismissible = true,
}: Omit<ModalProps, "open">) {
  const isPhone = useMediaQuery("(max-width: 639px)");
  const { reduced } = useMotionPrefs();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const titleId = useSafeId("modal-title");
  const descriptionId = useSafeId("modal-description");
  // While the exit animation plays the panel is no longer "present": release
  // the scroll lock and return focus at once instead of after the animation.
  const isPresent = useIsPresent();

  useScrollLock(isPresent);
  useFocusTrap(panelRef, { initialFocus, onEscape: dismissible ? onClose : undefined, active: isPresent });

  const entrance = isPhone
    ? { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }
    : {
        initial: { opacity: 0, scale: 0.92, rotate: -2, y: 16 },
        animate: { opacity: 1, scale: 1, rotate: 0, y: 0 },
        exit: { opacity: 0, scale: 0.96, y: 8 },
      };

  return (
    <div
      className={cx(
        "fixed inset-0 z-(--z-modal) flex items-end justify-center sm:items-center sm:p-6",
        !isPresent && "pointer-events-none",
      )}
    >
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-(--scrim)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={dismissible ? onClose : undefined}
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cx(
          "relative flex max-h-[92dvh] w-full flex-col overflow-hidden border border-line bg-surface text-ink outline-none",
          "rounded-t-card-lg pb-[env(safe-area-inset-bottom)] sm:rounded-card-lg sm:pb-0",
          WIDTH[size],
        )}
        {...entrance}
        transition={reduced ? { duration: 0 } : spring.arrive}
        drag={isPhone && dismissible ? "y" : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.7 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 120 || info.velocity.y > 600) onClose();
        }}
      >
        {isPhone && dismissible ? (
          <div
            aria-hidden
            onPointerDown={(event) => dragControls.start(event)}
            className="grid h-7 shrink-0 cursor-grab touch-none place-items-center"
          >
            <span className="h-1.5 w-12 rounded-pill bg-ink-3" />
          </div>
        ) : null}
        <header className="flex items-start gap-4 px-6 pt-4 sm:px-8 sm:pt-7">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className={cx("type-heading-sm", hideTitle && "sr-only")}>
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1.5 type-body text-ink-2">
                {description}
              </p>
            ) : null}
          </div>
          {dismissible ? <IconButton glyph="close" label="Close" variant="ghost" size="sm" onClick={onClose} /> : null}
        </header>
        {children ? <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 sm:px-8">{children}</div> : <div className="h-5" />}
        {footer ? <footer className="flex flex-wrap justify-end gap-2 px-6 pb-6 sm:px-8 sm:pb-7">{footer}</footer> : null}
      </motion.div>
    </div>
  );
}
