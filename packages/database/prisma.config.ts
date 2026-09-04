// Prisma 7 config: the CLI (migrate/studio/db pull) reads its connection
// string from here, not from `datasource.url` in schema.prisma — that
// property was removed in 7.x. Application code gets its own connection
// via a driver adapter (see index.ts); this file only governs CLI commands.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
    // Needed by `prisma migrate diff --from-migrations` (replaying the
    // migration set onto a scratch database). Defaults to the main URL —
    // point SHADOW_DATABASE_URL at a scratch database for real diffs.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ?? process.env.DATABASE_URL,
  },
});
