"use client";

import { CircleAlert } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/** Error boundary for app pages — keeps the shell (sidebar/topbar) intact. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <CircleAlert className="size-6" aria-hidden />
      </div>
      <div>
        <h1 className="text-lg font-semibold tracking-tight">This page hit a problem</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Your bots keep running — only this view failed to load. Try again.
        </p>
      </div>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
