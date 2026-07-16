import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Profile",
};

function initials(name: string | null | undefined, email: string): string {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { user } = session;
  const isDemo = user.id.startsWith("usr-demo");

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your account details and identity.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="text-lg font-semibold">
              {initials(user.name, user.email ?? "?")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate text-base font-semibold">{user.name ?? "Unnamed"}</p>
              <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              {isDemo ? <Badge variant="outline">Demo account</Badge> : null}
            </div>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-0">
          <CardTitle className="text-base">Account details</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {isDemo
              ? "Demo accounts are read-only — changes won't be saved."
              : "Update how your name appears across Pipflow."}
          </p>
        </CardHeader>
        <CardContent>
          <ProfileForm initialName={user.name ?? ""} email={user.email ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-0">
          <CardTitle className="text-base">Security</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Change your password via the email reset flow.
          </p>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/forgot-password">Reset password</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
