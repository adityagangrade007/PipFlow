import {
  Bell,
  Bot,
  ChartPie,
  LayoutDashboard,
  LineChart,
  Settings,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Pages that ship in later phases render as visibly disabled. */
  enabled: boolean;
}

export const appNavItems: AppNavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Portfolio", href: "/portfolio", icon: Wallet, enabled: true },
  { label: "Bots", href: "/bots", icon: Bot, enabled: true },
  { label: "Trades", href: "/trades", icon: LineChart, enabled: true },
  { label: "Analytics", href: "/analytics", icon: ChartPie, enabled: true },
  { label: "Notifications", href: "/notifications", icon: Bell, enabled: true },
  { label: "Settings", href: "/settings", icon: Settings, enabled: true },
];
