import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import { prisma } from "@artcollect/database";

/**
 * Credentials (email + password) auth, JWT session strategy.
 *
 * The Credentials provider is explicitly JWT-only in Auth.js — a database
 * session strategy requires an adapter-managed Session table, which this
 * app doesn't have (see packages/database/prisma/schema.prisma: our own
 * `Session` model is an audit/telemetry table, not Auth.js's session
 * store). Role data is looked up once at sign-in and carried in the JWT via
 * the `jwt` callback below, then exposed on `session.user` via `session` —
 * see src/types/next-auth.d.ts for the augmented types.
 *
 * OAuth providers (Google, etc.) can be added to `providers` later without
 * touching this structure; they don't require the database session store
 * either as long as `session.strategy` stays `"jwt"`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email =
          typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: true },
        });
        if (!user?.passwordHash || user.status !== "active") return null;

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles.map((assignment) => assignment.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
      }
      return token;
    },
    async session({ session, token }) {
      // Cast rather than annotate the destructured parameter: NextAuth's
      // inferred callback signature is a union over both session
      // strategies (JWT vs database-adapter), which leaves `token`'s
      // fields unhelpfully widened; a parameter-level type annotation to
      // fix that is expensive enough for TypeScript to instantiate here
      // that it blows past the default heap. A local cast is cheap and
      // scoped to just the two fields this callback actually reads.
      const jwt = token as JWT;
      if (session.user) {
        session.user.id = jwt.id ?? "";
        session.user.roles = jwt.roles ?? [];
      }
      return session;
    },
  },
});
