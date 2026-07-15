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
  { label: "Portfolio", href: "/portfolio", icon: Wallet, enabled: false },
  { label: "Bots", href: "/bots", icon: Bot, enabled: false },
  { label: "Trades", href: "/trades", icon: LineChart, enabled: false },
  { label: "Analytics", href: "/analytics", icon: ChartPie, enabled: false },
  { label: "Notifications", href: "/notifications", icon: Bell, enabled: false },
  { label: "Settings", href: "/settings", icon: Settings, enabled: false },
];
