import type { Metadata } from "next";

import { NotificationsView } from "@/components/notifications/notifications-view";
import { getNotificationsFeed } from "@/lib/mock/dashboard";

export const metadata: Metadata = {
  title: "Notifications",
};

export default function NotificationsPage() {
  const feed = getNotificationsFeed();
  return (
    <div className="mx-auto w-full max-w-4xl">
      <NotificationsView initial={feed} />
    </div>
  );
}
