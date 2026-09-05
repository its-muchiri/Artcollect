import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Local editorial/artwork images already go through next/image; this is
  // the one external host used for placeholder/demo imagery (Wanjiku's
  // seed photos, journal covers) so those can too instead of staying
  // unoptimized <img> tags.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // Consume the shared internal workspace packages' TS source directly —
  // they ship no build step of their own (see packages/database,
  // packages/ui, packages/contracts).
  transpilePackages: ["@artcollect/database", "@artcollect/ui", "@artcollect/contracts"],
  // No explicit turbopack.root override: this app's node_modules are
  // hoisted to the monorepo root by npm workspaces, and Next's own
  // nearest-lockfile detection already resolves that root correctly now
  // that there's exactly one lockfile in the repo. Pinning root to this
  // app's own directory (as a previous revision did) breaks resolution of
  // hoisted packages like `next` itself.
  agentRules: false,
};

export default nextConfig;
