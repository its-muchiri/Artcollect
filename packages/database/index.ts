/**
 * Shared Prisma client singleton.
 *
 * Both `apps/artcollect-web` and `apps/tikoyetu-web` import from
 * `@artcollect/database` rather than instantiating `PrismaClient`
 * themselves, so there is exactly one client (and one connection pool)
 * per platform's server runtime. In Next.js dev mode, module state
 * survives hot-reload, so a naive `new PrismaClient()` at module scope
 * would open a fresh connection pool on every edit; caching the instance on
 * `globalThis` in non-production avoids that.
 *
 * Prisma 7 dropped the bundled Rust query engine — the client now connects
 * through an explicit JS driver adapter (`@prisma/adapter-pg` wrapping
 * `pg`) instead of an implicit `datasource.url` lookup, so the connection
 * string is read here, not in schema.prisma.
 */
import { PrismaClient } from "./generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var -- required shape for the globalThis cache pattern
  var __artcollectPrisma: PrismaClient | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy packages/database/.env.example to .env and point it at a real Postgres instance.",
    );
  }

  const adapter = new PrismaPg(connectionString);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalThis.__artcollectPrisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__artcollectPrisma = prisma;
}

export * from "./generated/client/client";
