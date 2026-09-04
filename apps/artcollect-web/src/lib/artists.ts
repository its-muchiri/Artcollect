import "server-only";
import { prisma, type ArtistDisciplineTier } from "@artcollect/database";
import type { ArtworkCard } from "@/lib/artworks";
import { listPublishedArtworks } from "@/lib/artworks";

/**
 * Artist reads for the handwritten-annotation profile pages (docs/11
 * Phase 4). Published ArtistProfiles only.
 */

export interface ArtistCard {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  bio: string | null;
  location: string | null;
  websiteUrl: string | null;
  artworkCount: number;
  /**
   * Placeholder portrait imagery (docs/11 assumption #1 — Unsplash, until
   * real ArtCollect portraits exist; the schema has no portrait column
   * yet). Keyed by slug so it's stable per artist.
   */
  portraitUrl: string;
}

export interface ArtistDisciplineCard {
  name: string;
  emoji: string | null;
  tier: ArtistDisciplineTier;
  description: string | null;
}

export interface ArtistTimelineCard {
  year: number;
  title: string;
  description: string;
}

export interface ArtistCollaborationCard {
  title: string;
  description: string;
}

export interface ArtistDetail extends ArtistCard {
  artworks: ArtworkCard[];
  /** Primary disciplines first, then secondary — sort order preserved within each tier. */
  disciplines: ArtistDisciplineCard[];
  /** Reverse chronological (most recent first). */
  timeline: ArtistTimelineCard[];
  collaborations: ArtistCollaborationCard[];
}

const PLACEHOLDER_PORTRAITS: Record<string, string> = {
  "wanjiku-mwangi":
    "https://images.unsplash.com/photo-1531123897727-8f129e1684ce?auto=format&fit=crop&w=800&q=70",
  // Ben's own photo (public/artists/ben-mungai/), not a stock placeholder —
  // kept in this map anyway since it's the same "slug -> portrait" lookup
  // every other artist uses; nothing else needs to change once a real
  // portrait column exists on ArtistProfile.
  "ben-mungai": "/artists/ben-mungai/portrait.jpeg",
};

const FALLBACK_PORTRAIT =
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=800&q=70";

export async function listPublishedArtists(): Promise<ArtistCard[]> {
  const artists = await prisma.artistProfile.findMany({
    where: { visibility: "published" },
    include: {
      user: { select: { name: true } },
      _count: { select: { artworks: { where: { status: "published", deletedAt: null } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return artists.map((artist) => ({
    id: artist.id,
    slug: artist.slug,
    name: artist.user.name ?? "Unknown artist",
    tagline: artist.tagline,
    bio: artist.bio,
    location: artist.location,
    websiteUrl: artist.websiteUrl,
    artworkCount: artist._count.artworks,
    portraitUrl: PLACEHOLDER_PORTRAITS[artist.slug] ?? FALLBACK_PORTRAIT,
  }));
}

export async function getArtistBySlug(slug: string): Promise<ArtistDetail | null> {
  const artist = await prisma.artistProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { name: true } },
      disciplines: { orderBy: { sortOrder: "asc" } },
      timeline: { orderBy: [{ year: "desc" }, { sortOrder: "asc" }] },
      collaborations: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!artist || artist.visibility !== "published") return null;

  const allArtworks = await listPublishedArtworks();
  const artworks = allArtworks.filter((a) => a.artistSlug === slug);

  // Primary tier first, secondary after — stable within each tier since
  // the query already ordered by sortOrder.
  const disciplines = [...artist.disciplines].sort((a, b) =>
    a.tier === b.tier ? 0 : a.tier === "primary" ? -1 : 1,
  );

  return {
    id: artist.id,
    slug: artist.slug,
    name: artist.user.name ?? "Unknown artist",
    tagline: artist.tagline,
    bio: artist.bio,
    location: artist.location,
    websiteUrl: artist.websiteUrl,
    artworkCount: artworks.length,
    portraitUrl: PLACEHOLDER_PORTRAITS[artist.slug] ?? FALLBACK_PORTRAIT,
    artworks,
    disciplines: disciplines.map((d) => ({
      name: d.name,
      emoji: d.emoji,
      tier: d.tier,
      description: d.description,
    })),
    timeline: artist.timeline.map((t) => ({ year: t.year, title: t.title, description: t.description })),
    collaborations: artist.collaborations.map((c) => ({ title: c.title, description: c.description })),
  };
}

/**
 * The profile page's signature quote: the artist's own tagline when they
 * have one, otherwise the first sentence of their bio — both are always
 * real, artist-grounded content, never an invented pull-quote.
 */
export function profileQuote(tagline: string | null, bio: string | null): string | null {
  if (tagline && tagline.trim().length > 0) return tagline.trim();
  if (!bio) return null;
  const firstSentence = bio.split(/(?<=[.!?])\s+/)[0]?.trim();
  return firstSentence && firstSentence.length > 0 ? firstSentence : null;
}
