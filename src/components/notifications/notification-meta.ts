import {
  ArrowDownToLine,
  ArrowUpFromLine,
  FileText,
  Target,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import type { NotificationType } from "@/lib/mock/dashboard";

interface NotificationMeta {
  icon: LucideIcon;
  /** Icon chip classes — status colors are reserved for state, per design system. */
  className: string;
}

export const notificationMeta: Record<NotificationType, NotificationMeta> = {
  TRADE_OPENED: {
    icon: ArrowUpFromLine,
    className: "bg-primary/10 text-primary",
  },
  TRADE_CLOSED: {
    icon: ArrowDownToLine,
    className: "bg-profit/10 text-profit",
  },
  RISK_ALERT: {
    icon: TriangleAlert,
    className: "bg-loss/10 text-loss",
  },
  CONNECTION_LOST: {
    icon: WifiOff,
    className: "bg-muted text-muted-foreground",
  },
  PROFIT_TARGET: {
    icon: Target,
    className: "bg-profit/10 text-profit",
  },
  DAILY_REPORT: {
    icon: FileText,
    className: "bg-muted text-muted-foreground",
  },
};
