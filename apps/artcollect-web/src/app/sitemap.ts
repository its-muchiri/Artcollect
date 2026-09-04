import type { MetadataRoute } from "next";
import { prisma } from "@artcollect/database";

/**
 * Generated sitemap (technical SEO baseline — this app had none before).
 * Static routes are listed by hand; artist profiles and journal posts are
 * pulled live so a newly published one is indexed on the next crawl
 * without a code change.
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://artcollect-web.vercel.app";

const STATIC_ROUTES = ["/", "/browse", "/artists", "/journal", "/causes", "/timeline", "/events"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [artists, posts] = await Promise.all([
    prisma.artistProfile.findMany({
      where: { visibility: "published" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.post.findMany({
      where: { status: "published" },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));

  const artistEntries: MetadataRoute.Sitemap = artists.map((artist) => ({
    url: `${BASE_URL}/artists/${artist.slug}`,
    lastModified: artist.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/journal/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...artistEntries, ...postEntries];
}
