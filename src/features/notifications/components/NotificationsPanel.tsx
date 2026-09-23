import { useState } from "react";
import { getErrorMessage } from "@/shared/api/errors";
import { Button } from "@/shared/kit/Button";
import { EmptyState } from "@/shared/kit/EmptyState";
import { ErrorState } from "@/shared/kit/ErrorState";
import { PosterHeader } from "@/shared/kit/PosterHeader";
import { Tabs } from "@/shared/kit/Segmented";
import { ListSkeleton } from "@/shared/kit/Skeleton";
import { tabId, tabPanelId } from "@/shared/kit/tabIds";
import { useToast } from "@/shared/kit/toast/useToast";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from "../hooks/useNotifications";
import type { NotificationFilter } from "../model/notification.types";
import { NotificationItem } from "./NotificationItem";

const TABS_ID = "alerts";

/** Everything that happened to your posts and your profile, newest first. */
export function NotificationsPanel() {
  const toast = useToast();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const onlyUnread = filter === "unread";

  const { data: notifications = [], isPending, error, refetch } = useNotifications(onlyUnread);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markOne = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const fail = (failure: unknown) =>
    toast.show({ tone: "error", title: "That didn’t stick", description: getErrorMessage(failure, "Your alerts didn’t update. Try again.") });

  return (
    <div className="mx-auto grid max-w-(--reading) gap-6">
      <PosterHeader
        title="Alerts"
        lede="Likes, comments, shares and follows."
        actions={
          <Button
            variant="secondary"
            size="sm"
            iconStart="check"
            loading={markAll.isPending}
            disabled={unreadCount <= 0}
            onClick={() => markAll.mutate(undefined, { onSuccess: () => toast.show({ title: "All caught up." }), onError: fail })}
          >
            Mark all read
          </Button>
        }
      >
        <Tabs
          idBase={TABS_ID}
          label="Filter alerts"
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread", count: unreadCount > 0 ? unreadCount : undefined },
          ]}
          value={filter}
          onChange={setFilter}
          className="justify-self-start"
        />
      </PosterHeader>

      <div
        role="tabpanel"
        id={tabPanelId(TABS_ID, filter)}
        aria-labelledby={tabId(TABS_ID, filter)}
        aria-busy={isPending}
        className="grid gap-3"
      >
        {isPending ? (
          <ListSkeleton rows={5} label="Loading alerts" />
        ) : error ? (
          <ErrorState
            title="Alerts didn’t load"
            message={getErrorMessage(error, "Check your connection and try again.")}
            onRetry={() => void refetch()}
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            object="bell-deflated"
            title={onlyUnread ? "All caught up." : "Nothing yet."}
            body={
              onlyUnread
                ? "New alerts land here first."
                : "When someone likes, comments on or shares your posts — or follows you — it shows up here."
            }
          />
        ) : (
          <ol className="grid gap-2">
            {notifications.map((notification) => (
              <li key={notification.id || `${notification.actorName}-${notification.createdAt}`}>
                <NotificationItem
                  notification={notification}
                  isMarking={markOne.isPending && markOne.variables === notification.id}
                  onMarkRead={(notificationId) => markOne.mutate(notificationId, { onError: fail })}
                />
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
