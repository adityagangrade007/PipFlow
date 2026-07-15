import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-4">
        <path
          d="M4 17 9.5 10l4 4L20 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn("flex items-center gap-2.5", className)}
    >
      <LogoMark />
      <span className="text-[17px] font-semibold tracking-tight">{siteConfig.name}</span>
    </Link>
  );
}
