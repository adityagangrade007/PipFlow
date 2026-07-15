import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { Toaster } from "@/components/ui/sonner";
import { getDashboardData } from "@/lib/mock/dashboard";
import { QueryProvider } from "@/providers/query-provider";
import { auth } from "@/server/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Middleware already guards these routes; this is defense in depth.
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { notifications } = getDashboardData();

  return (
    <div className="min-h-dvh">
      <AppSidebar />
      <div className="flex min-h-dvh flex-col md:pl-[4.25rem] lg:pl-60">
        <AppTopbar
          user={{
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
          }}
          notifications={notifications}
        />
        <main className="flex-1 px-4 pt-6 pb-24 sm:px-6 md:pb-10">
          <QueryProvider>{children}</QueryProvider>
        </main>
      </div>
      <MobileTabBar />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
