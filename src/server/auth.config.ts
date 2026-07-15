import type { Role } from "@prisma/client";
import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 *
 * Imported by the middleware, so it must not pull in Prisma, bcrypt or any
 * other Node-only dependency. The Prisma adapter and Credentials provider are
 * added in `auth.ts`, which only runs in the Node.js runtime.
 */
export const authConfig = {
  // The app is deployed behind a trusted proxy (Vercel); required for
  // Auth.js to accept the request host in production.
  trustHost: true,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      // `user` is only defined on sign-in; persist our custom fields into the token.
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      // The JWT type from @auth/core keeps custom claims as `unknown`; these
      // are always set by the jwt callback above.
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
} satisfies NextAuthConfig;
