import { Bot, ListChecks, TrendingUp, Users } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime } from "@/lib/format";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { listRecentCommands } from "@/server/services/command-store";
import { getAccountSummary, getBots } from "@/server/services/mock-trading";

export const metadata: Metadata = {
  title: "Admin",
};

interface AdminUserRow {
  name: string;
  email: string;
  role: string;
  createdAt: string | null;
  demo: boolean;
}

const DEMO_USER_ROWS: AdminUserRow[] = [
  {
    name: "Demo Trader",
    email: "demo@pipflow.app",
    role: "USER",
    createdAt: null,
    demo: true,
  },
  {
    name: "Demo Admin",
    email: "admin@pipflow.app",
    role: "ADMIN",
    createdAt: null,
    demo: true,
  },
];

async function loadUsers(): Promise<{ users: AdminUserRow[]; dbConnected: boolean }> {
  try {
    const rows = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { name: true, email: true, role: true, createdAt: true },
    });
    return {
      users: [
        ...rows.map((u) => ({
          name: u.name ?? "—",
          email: u.email,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
          demo: false,
        })),
        ...DEMO_USER_ROWS,
      ],
      dbConnected: true,
    };
  } catch {
    return { users: DEMO_USER_ROWS, dbConnected: false };
  }
}

const COMMAND_STATUS_TONE: Record<string, string> = {
  EXECUTED: "text-profit",
  FAILED: "text-loss",
  PENDING: "text-muted-foreground",
  ACKNOWLEDGED: "text-muted-foreground",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [{ users, dbConnected }, account, bots, commands] = [
    await loadUsers(),
    getAccountSummary(),
    getBots(),
    listRecentCommands(),
  ];
  const botNames = new Map(bots.map((b) => [b.id, b.name]));

  const stats = [
    { icon: Users, label: "Users", value: users.length.toString() },
    {
      icon: Bot,
      label: "Bots running",
      value: `${account.runningBots} / ${account.totalBots}`,
    },
    {
      icon: TrendingUp,
      label: "Simulated trades",
      value: account.totalTrades.toLocaleString("en-US"),
    },
    { icon: ListChecks, label: "Commands issued", value: commands.length.toString() },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Admin panel</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform overview, users and the EA command audit log.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="py-0">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-base">Users</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {dbConnected
                ? "Registered accounts plus the built-in demo accounts."
                : "Database not connected — showing the built-in demo accounts."}
            </p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.email}>
                    <TableCell>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                          {user.role}
                        </Badge>
                        {user.demo ? <Badge variant="outline">demo</Badge> : null}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "built-in"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0">
            <CardTitle className="text-base">Command log</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Remote EA commands issued this session (in-memory in the prototype).
            </p>
          </CardHeader>
          <CardContent>
            {commands.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No commands issued yet — control a bot from the Bots page.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Bot</TableHead>
                    <TableHead>Command</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commands.slice(0, 12).map((cmd) => (
                    <TableRow key={cmd.id}>
                      <TableCell className="text-sm">
                        {botNames.get(cmd.botId) ?? cmd.botId}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{cmd.type}</TableCell>
                      <TableCell
                        className={`text-xs font-semibold ${COMMAND_STATUS_TONE[cmd.status] ?? ""}`}
                      >
                        {cmd.status}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatRelativeTime(cmd.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
