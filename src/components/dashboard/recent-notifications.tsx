import { notificationMeta } from "@/components/notifications/notification-meta";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/format";
import type { NotificationItem } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

export function RecentNotifications({
  notifications,
  className,
}: {
  notifications: NotificationItem[];
  className?: string;
}) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Card className={className}>
      <CardHeader className="space-y-0">
        <CardTitle className="text-base">Recent notifications</CardTitle>
        <p className="mt-1 text-sm text-muted-foreground">{unread} unread</p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {notifications.map((notification) => {
            const meta = notificationMeta[notification.type];
            return (
              <li
                key={notification.id}
                className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                    meta.className
                  )}
                >
                  <meta.icon className="size-4" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{notification.title}</p>
                    {!notification.read ? (
                      <span
                        className="size-1.5 shrink-0 rounded-full bg-primary"
                        aria-label="Unread"
                      />
                    ) : null}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {notification.body}
                  </p>
                </div>
                <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
