"use client";

import { Laptop, LogOut, Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Laptop },
] as const;

const NOTIFICATION_PREFS = [
  { key: "tradeEvents", label: "Trade opened / closed", defaultOn: true },
  { key: "riskAlerts", label: "Risk alerts", defaultOn: true },
  { key: "connection", label: "Connection status", defaultOn: true },
  { key: "dailyReport", label: "Daily report", defaultOn: false },
] as const;

const PREFS_STORAGE_KEY = "pipflow:notification-prefs";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIFICATION_PREFS.map((p) => [p.key, p.defaultOn]))
  );

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(PREFS_STORAGE_KEY);
      if (stored) setPrefs((prev) => ({ ...prev, ...JSON.parse(stored) }));
    } catch {
      // Corrupt local storage — keep defaults.
    }
  }, []);

  function togglePref(key: string, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(next));
    toast.success("Notification preferences saved");
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Appearance, notifications and account actions.
        </p>
      </div>

      <Card>
        <CardHeader className="space-y-0">
          <CardTitle className="text-base">Appearance</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how Pipflow looks on this device.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Theme">
            {THEMES.map((t) => {
              const active = mounted && theme === t.value;
              return (
                <button
                  key={t.value}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <t.icon className="size-5" aria-hidden />
                  {t.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-0">
          <CardTitle className="text-base">Notifications</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Which events reach you. Stored on this device in the prototype.
          </p>
        </CardHeader>
        <CardContent className="space-y-1">
          {NOTIFICATION_PREFS.map((pref, i) => (
            <div key={pref.key}>
              {i > 0 ? <Separator /> : null}
              <div className="flex items-center justify-between py-3">
                <Label htmlFor={`pref-${pref.key}`} className="text-sm font-normal">
                  {pref.label}
                </Label>
                <Switch
                  id={`pref-${pref.key}`}
                  checked={prefs[pref.key] ?? pref.defaultOn}
                  onCheckedChange={(v) => togglePref(pref.key, v)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-0">
          <CardTitle className="text-base">Session</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign out of Pipflow on this device.
          </p>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => void signOut({ callbackUrl: "/" })}>
            <LogOut className="size-4" aria-hidden />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
