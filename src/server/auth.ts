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

        // Built-in demo account for showcasing the prototype — works without
        // a database. Remove when the product goes live.
        if (email === "demo@pipflow.app" && parsed.data.password === "demo1234") {
          return {
            id: "usr-demo",
            name: "Demo Trader",
            email,
            image: null,
            role: "USER" as const,
          };
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
