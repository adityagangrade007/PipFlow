"use client";

import { BellOff, CheckCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { notificationMeta } from "@/components/notifications/notification-meta";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatRelativeTime } from "@/lib/format";
import type { NotificationItem } from "@/lib/mock/dashboard";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread" | "trades" | "alerts";

const FILTERS: Record<Filter, (n: NotificationItem) => boolean> = {
  all: () => true,
  unread: (n) => !n.read,
  trades: (n) => n.type === "TRADE_OPENED" || n.type === "TRADE_CLOSED",
  alerts: (n) =>
    n.type === "RISK_ALERT" ||
    n.type === "CONNECTION_LOST" ||
    n.type === "PROFIT_TARGET" ||
    n.type === "DAILY_REPORT",
};

function dayLabel(iso: string, now: Date): string {
  const date = new Date(iso);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function NotificationsView({ initial }: { initial: NotificationItem[] }) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("all");
  const now = useMemo(() => new Date(), []);

  const items = initial.map((n) => ({ ...n, read: n.read || readIds.has(n.id) }));
  const unreadCount = items.filter((n) => !n.read).length;
  const visible = items.filter(FILTERS[filter]);

  const groups = visible.reduce<{ label: string; items: NotificationItem[] }[]>(
    (acc, item) => {
      const label = dayLabel(item.createdAt, now);
      const last = acc[acc.length - 1];
      if (last?.label === label) last.items.push(item);
      else acc.push({ label, items: [item] });
      return acc;
    },
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount} unread · trade events, risk alerts and reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={() => setReadIds(new Set(initial.map((n) => n.id)))}
          >
            <CheckCheck className="size-3.5" aria-hidden />
            Mark all read
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={BellOff}
              title="Nothing here"
              description={
                filter === "unread"
                  ? "You're all caught up."
                  : "Notifications matching this filter will appear here."
              }
            />
          </CardContent>
        </Card>
      ) : (
        groups.map((group) => (
          <section key={group.label} aria-label={group.label}>
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {group.label}
            </h2>
            <Card className="py-2">
              <CardContent className="px-4">
                <ul className="divide-y">
                  {group.items.map((n) => {
                    const meta = notificationMeta[n.type];
                    return (
                      <li key={n.id} className="flex items-start gap-3 py-3">
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
                            <p className="truncate text-sm font-medium">{n.title}</p>
                            {!n.read ? (
                              <span
                                className="size-1.5 shrink-0 rounded-full bg-primary"
                                aria-label="Unread"
                              />
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                        </div>
                        <span className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">
                          {formatRelativeTime(n.createdAt, now)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </section>
        ))
      )}
    </div>
  );
}
