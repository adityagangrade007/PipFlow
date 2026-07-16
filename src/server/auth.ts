import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/server/auth.config";
import { db } from "@/server/db";
import { loginSchema } from "@/lib/validators/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();

        // Built-in demo accounts for showcasing the prototype — they work
        // without a database. Remove when the product goes live.
        const demoAccounts: Record<
          string,
          { password: string; id: string; name: string; role: "USER" | "ADMIN" }
        > = {
          "demo@pipflow.app": {
            password: "demo1234",
            id: "usr-demo",
            name: "Demo Trader",
            role: "USER",
          },
          "admin@pipflow.app": {
            password: "admin1234",
            id: "usr-demo-admin",
            name: "Demo Admin",
            role: "ADMIN",
          },
        };
        const demo = demoAccounts[email];
        if (demo && parsed.data.password === demo.password) {
          return { id: demo.id, name: demo.name, email, image: null, role: demo.role };
        }
        const user = await db.user.findUnique({ where: { email } });
        // No user, or an OAuth-only account without a password set.
        if (!user?.passwordHash) return null;

        const passwordValid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash
        );
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
});
