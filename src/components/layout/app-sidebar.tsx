"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { appNavItems } from "@/components/layout/app-nav-items";
import { LogoMark } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Desktop navigation: full sidebar at `lg`, icon-only rail at `md`.
 * Hidden below `md` (the mobile tab bar takes over).
 */
export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[4.25rem] flex-col border-r bg-card md:flex lg:w-60">
      <div className="flex h-16 items-center border-b px-4 lg:px-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="hidden text-[17px] font-semibold tracking-tight lg:inline">
            {siteConfig.name}
          </span>
        </Link>
      </div>

      <nav aria-label="App" className="flex flex-1 flex-col gap-1 p-2.5 lg:p-3">
        {appNavItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          if (!item.enabled) {
            return (
              <span
                key={item.href}
                aria-disabled
                title={`${item.label} — coming soon`}
                className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50"
              >
                <item.icon className="size-4.5 shrink-0" aria-hidden />
                <span className="hidden flex-1 lg:inline">{item.label}</span>
                <span className="hidden rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase lg:inline">
                  Soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="size-4.5 shrink-0" aria-hidden />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div className="hidden rounded-lg border bg-muted/40 p-3 lg:block">
          <p className="text-xs font-semibold">Simulation mode</p>
          <p className="mt-1 text-xs text-muted-foreground">
            All trading data is simulated. Connect a live MT4/MT5 bridge later without
            changing anything here.
          </p>
        </div>
        <div
          className="mx-auto size-2 rounded-full bg-primary/60 lg:hidden"
          title="Simulation mode"
        />
      </div>
    </aside>
  );
}
