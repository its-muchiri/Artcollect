import { defineConfig } from "vitest/config";

/**
 * Root vitest harness. Added in Phase 1 of the v2 redesign (docs/11) — the
 * monorepo previously had no test runner at all.
 *
 * One root config fans out to per-package project configs so each package
 * keeps its own aliases/environment (e.g. artcollect-web aliases `@/` and
 * stubs `server-only`), while `npm test` at the root runs every suite in
 * one go. Target one package with `npm test -w <pkg>` or
 * `npx vitest run --project <name>`.
 *
 * apps/tikoyetu-web was merged into apps/artcollect-web (see the conjoin
 * plan) — its project entry moved with it rather than staying listed here.
 */
export default defineConfig({
  test: {
    projects: [
      "./packages/ui/vitest.config.ts",
      "./packages/contracts/vitest.config.ts",
      "./apps/artcollect-web/vitest.config.ts",
    ],
  },
});
