import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * artcollect-web's vitest project.
 *
 * - `@/` maps to `src/` like the app's tsconfig paths.
 * - `server-only` is stubbed: the real package throws on import outside a
 *   React Server Component bundler, but the lib modules under test import
 *   it for *bundler* enforcement (keeping server-only code out of client
 *   bundles), not runtime behavior.
 * - `packages/database/.env` is loaded so the real `@artcollect/database`
 *   module can be imported by the database-backed idempotency tests
 *   (`order-fulfillment.db.test.ts`, `donation-fulfillment.db.test.ts`).
 *   Unit tests mock that module entirely; creating the PrismaClient itself
 *   is lazy and opens no connection.
 */
function loadDatabaseEnv(): void {
  // Minimal .env parser — enough for the single-line KEY="value" file.
  const file = path.resolve(__dirname, "../../packages/database/.env");
  try {
    const contents = fs.readFileSync(file, "utf8");
    for (const line of contents.split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/.exec(line);
      if (match && !process.env[match[1]!]) {
        process.env[match[1]!] = match[2]!;
      }
    }
  } catch {
    // No .env — unit tests still run; only the DB-backed suites skip.
  }
}

loadDatabaseEnv();

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "server-only": path.resolve(__dirname, "src/test/stubs/server-only.ts"),
    },
  },
  test: {
    name: "artcollect-web",
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    testTimeout: 20000,
  },
});
