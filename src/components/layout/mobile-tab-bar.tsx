"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavItems } from "@/components/layout/app-nav-items";
import { cn } from "@/lib/utils";

// Dashboard, Bots, Trades, Notifications, Settings — the five core tabs.
const tabItems = appNavItems.filter((item) =>
  ["/dashboard", "/bots", "/trades", "/notifications", "/settings"].includes(item.href)
);

/** Bottom tab bar, mobile only. */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
    >
      <div className="grid h-16 grid-cols-5">
        {tabItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                aria-disabled
                className="flex flex-col items-center justify-center gap-1 text-muted-foreground/40"
              >
                <item.icon className="size-5" aria-hidden />
                <span className="text-[10px] font-medium">{item.label}</span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="size-5" aria-hidden />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
