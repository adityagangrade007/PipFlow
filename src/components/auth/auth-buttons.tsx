"use client";

import { SessionProvider, signOut, useSession } from "next-auth/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

interface AuthButtonsProps {
  /** "row" for the desktop header, "stack" for the mobile drawer. */
  layout?: "row" | "stack";
  /** Called when the user navigates (used to close the mobile drawer). */
  onNavigate?: () => void;
}

function AuthButtonsInner({ layout = "row", onNavigate }: AuthButtonsProps) {
  const { data: session, status } = useSession();
  const stacked = layout === "stack";
  const size = stacked ? "lg" : "default";

  if (status === "loading") {
    // Reserve space to avoid layout shift while the session resolves.
    return <div aria-hidden className={stacked ? "h-24" : "h-9 w-44"} />;
  }

  if (session?.user) {
    return (
      <div className={stacked ? "flex flex-col gap-3" : "flex items-center gap-3"}>
        <span
          className={
            stacked
              ? "truncate text-sm text-muted-foreground"
              : "hidden max-w-[18ch] truncate text-sm text-muted-foreground lg:inline"
          }
        >
          {session.user.name ?? session.user.email}
        </span>
        <Button asChild size={size}>
          <Link href="/dashboard" onClick={onNavigate}>
            Dashboard
          </Link>
        </Button>
        <Button
          variant="outline"
          size={size}
          onClick={() => {
            onNavigate?.();
            void signOut({ callbackUrl: "/" });
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div className={stacked ? "flex flex-col gap-3" : "flex items-center gap-1.5"}>
      {stacked ? (
        <>
          <Button asChild size="lg">
            <Link href={siteConfig.links.getStarted} onClick={onNavigate}>
              Get started
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={siteConfig.links.signIn} onClick={onNavigate}>
              Sign in
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Button asChild variant="ghost">
            <Link href={siteConfig.links.signIn}>Sign in</Link>
          </Button>
          <Button asChild>
            <Link href={siteConfig.links.getStarted}>Get started</Link>
          </Button>
        </>
      )}
    </div>
  );
}

/**
 * Session-aware sign-in / sign-out controls.
 * SessionProvider is scoped here (not in the root layout) so marketing pages
 * stay fully static — the session is fetched client-side after hydration.
 */
export function AuthButtons(props: AuthButtonsProps) {
  return (
    <SessionProvider>
      <AuthButtonsInner {...props} />
    </SessionProvider>
  );
}
