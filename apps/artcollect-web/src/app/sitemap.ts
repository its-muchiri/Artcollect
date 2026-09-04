import type { MetadataRoute } from "next";
import { prisma } from "@artcollect/database";

/**
 * Dynamic sitemap (docs/11-style technical SEO): static routes plus every
 * public dynamic surface — published journal posts, published artists,
 * on-sale ticketing events, and published donation causes. Rendered
 * per-request (force-dynamic) so freshly published content is crawlable
 * immediately.
 */

const BASE = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, artists, events, causes] = await Promise.all([
    prisma.post.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
    }),
    prisma.artistProfile.findMany({
      where: { visibility: "published" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.ticketingEvent.findMany({
      where: { status: { in: ["on_sale", "sales_paused", "sold_out"] } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.donationCause.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/browse",
    "/journal",
    "/causes",
    "/events",
    "/donate",
    "/artists",
    "/how-it-works",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...posts.map((post) => ({
      url: `${BASE}/journal/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...artists.map((artist) => ({
      url: `${BASE}/artists/${artist.slug}`,
      lastModified: artist.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${BASE}/events/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...causes.map((cause) => ({
      url: `${BASE}/donate/${cause.slug}`,
      lastModified: cause.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
  ];
}
