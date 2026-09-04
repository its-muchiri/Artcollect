/**
 * Test stub for the `server-only` package.
 *
 * The real package exists to make bundlers fail a build when
 * server-only modules are pulled into client bundles; it throws when
 * executed outside that bundler context. Vitest is neither, so tests map
 * `server-only` to this inert stub via `apps/tikoyetu-web/vitest.config.ts`.
 */
export {};
