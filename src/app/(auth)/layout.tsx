import { ShieldCheck } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { siteConfig } from "@/lib/site";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form panel */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name} — prototype, all trading data is
          simulated.
        </p>
      </div>

      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-l bg-muted/30 p-10 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_10%,transparent_100%)]"
        />
        <div
          aria-hidden
          className="absolute top-1/4 left-1/2 h-80 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative ml-auto flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          Encrypted command channel
        </div>

        <figure className="relative max-w-md">
          <blockquote className="text-2xl font-medium tracking-tight text-balance">
            &ldquo;I paused a runaway grid bot from a beach in Lisbon. That alone paid for
            the year.&rdquo;
          </blockquote>
          <figcaption className="mt-4 text-sm text-muted-foreground">
            Amara O. — prop trader, 14 EAs under management
          </figcaption>
        </figure>

        <dl className="relative grid max-w-md grid-cols-3 gap-4">
          {[
            { value: "12,400+", label: "bots managed" },
            { value: "99.98%", label: "uptime" },
            { value: "<50 ms", label: "command latency" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-card/60 p-4">
              <dd className="text-lg font-semibold tracking-tight tabular-nums">
                {stat.value}
              </dd>
              <dt className="mt-1 text-xs text-muted-foreground">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
