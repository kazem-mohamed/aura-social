import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";
import { Sticker } from "@/shared/brand/Sticker";
import type { StickerName } from "@/shared/brand/stickerPaths";
import { formatDateTime, formatRelativeShort } from "@/shared/lib/dates";
import { Avatar } from "@/shared/kit/Avatar";
import { cx } from "@/shared/kit/cx";
import { IconButton } from "@/shared/kit/IconButton";
import { routes } from "@/app/router/routes";
import type { AppNotification } from "../model/notification.types";

interface Kind {
  sticker: StickerName;
  fill: string;
  label: string;
}

/** What happened, as the matching sticker on the actor's avatar. */
function kindOf(type: string): Kind {
  if (type.includes("follow")) return { sticker: "sparkle", fill: "var(--mint)", label: "Follow" };
  if (type.includes("like")) return { sticker: "heart", fill: "var(--ember)", label: "Like" };
  if (type.includes("share")) return { sticker: "share", fill: "var(--violet)", label: "Share" };
  return { sticker: "bubble", fill: "var(--blue)", label: "Comment" };
}

interface NotificationItemProps {
  notification: AppNotification;
  isMarking: boolean;
  onMarkRead: (notificationId: string) => void;
}

/**
 * One alert. An unread one sits on a surface with an ember dot. Marking it
 * read pops the dot, and the row settles into the page.
 */
export function NotificationItem({ notification, isMarking, onMarkRead }: NotificationItemProps) {
  const { actorId, actorName, actorPhoto, content, createdAt } = notification;
  const isUnread = !notification.isRead;
  const kind = kindOf(notification.type);
  const nameClass = "font-bold text-ink";

  return (
    <article
      className={cx(
        "flex items-start gap-3.5 rounded-card border p-4 transition-colors duration-300 sm:p-5",
        isUnread ? "border-line bg-surface" : "border-transparent",
      )}
    >
      <div className="relative shrink-0">
        {/* Alerts carry no handle, so no identity frame — just the face. */}
        <Avatar identityKey={actorName} name={actorName} photo={actorPhoto} frame={false} />
        <Sticker name={kind.sticker} fill={kind.fill} size={22} title={kind.label} className="absolute -right-2 -bottom-1.5" />
      </div>

      <div className="grid min-w-0 flex-1 gap-1">
        <p className={cx("break-words type-body", isUnread ? "text-ink" : "text-ink-2")}>
          {isUnread ? <span className="sr-only">Unread: </span> : null}
          {actorId ? (
            <Link
              to={routes.userProfile(actorId)}
              viewTransition
              className={cx(nameClass, "hover:underline hover:decoration-1 hover:underline-offset-4")}
            >
              {actorName}
            </Link>
          ) : (
            <span className={nameClass}>{actorName}</span>
          )}{" "}
          {content}
        </p>
        <time dateTime={createdAt ?? undefined} title={formatDateTime(createdAt)} className="type-caption text-ink-2 tnum">
          {formatRelativeShort(createdAt)}
        </time>
      </div>

      <AnimatePresence initial={false}>
        {isUnread ? (
          <motion.div
            key="unread"
            className="flex shrink-0 items-center gap-1"
            exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.2 } }}
          >
            <span aria-hidden className="h-2.5 w-2.5 rounded-full border border-carbon bg-ember" />
            <IconButton
              glyph="check"
              label={`Mark as read: ${actorName}`}
              variant="ghost"
              size="sm"
              disabled={!notification.id || isMarking}
              onClick={() => onMarkRead(notification.id)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
