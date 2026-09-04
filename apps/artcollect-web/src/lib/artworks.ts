import "server-only";
import { prisma } from "@artcollect/database";

/**
 * ArtCollect artwork reads for the vector-art browsing surfaces
 * (docs/11 Phase 3). Published artworks only, with the artist, primary
 * media, and lowest priced in-stock variant flattened into cards.
 */

export type ArtworkKind = "collage" | "print" | "photography" | "painting" | "other";

export interface ArtworkCard {
  id: string;
  slug: string;
  title: string;
  artistName: string;
  artistSlug: string;
  medium: string | null;
  yearCreated: number | null;
  kind: ArtworkKind;
  image: string | null;
  alt: string | null;
  /** Lowest-priced in-stock variant, in minor units. */
  priceMinor: number | null;
  currency: string | null;
  /** Coarse availability off the best variant's remaining stock. */
  availability: "available" | "low" | "sold";
}

/**
 * Coarse kind bucket for filtering, derived from the free-text `medium`
 * (the schema has no category column for artworks — this stays a UI-level
 * derivation rather than pretending there's structured data).
 */
export function artworkKindFromMedium(medium: string | null): ArtworkKind {
  const text = (medium ?? "").toLowerCase();
  if (text.includes("collage") || text.includes("mixed media")) return "collage";
  if (text.includes("print") || text.includes("edition")) return "print";
  if (text.includes("photograph") || text.includes("silver")) return "photography";
  if (text.includes("oil") || text.includes("acrylic") || text.includes("canvas")) return "painting";
  return "other";
}

function availabilityFromStock(stock: number): ArtworkCard["availability"] {
  if (stock <= 0) return "sold";
  if (stock === 1) return "low";
  return "available";
}

interface ArtworkRow {
  id: string;
  slug: string;
  title: string;
  medium: string | null;
  yearCreated: number | null;
  artist: { slug: string; user: { name: string | null } | null };
  media: { storageKey: string; altText: string | null; sortOrder: number }[];
  variants: { priceMinor: bigint; currency: string; stockQuantity: number }[];
}

function flatten(artwork: ArtworkRow): ArtworkCard {
  const inStock = artwork.variants.filter((v) => v.stockQuantity > 0);
  const best = inStock.length
    ? inStock.reduce((lowest, v) => (v.priceMinor < lowest.priceMinor ? v : lowest))
    : artwork.variants[0];
  const primaryMedia = [...artwork.media].sort((a, b) => a.sortOrder - b.sortOrder)[0];

  return {
    id: artwork.id,
    slug: artwork.slug,
    title: artwork.title,
    artistName: artwork.artist.user?.name ?? "Unknown artist",
    artistSlug: artwork.artist.slug,
    medium: artwork.medium,
    yearCreated: artwork.yearCreated,
    kind: artworkKindFromMedium(artwork.medium),
    image: primaryMedia?.storageKey ?? null,
    alt: primaryMedia?.altText ?? null,
    priceMinor: best ? Number(best.priceMinor) : null,
    currency: best?.currency ?? null,
    availability: best ? availabilityFromStock(best.stockQuantity) : "sold",
  };
}

export async function listPublishedArtworks(): Promise<ArtworkCard[]> {
  const artworks = await prisma.artwork.findMany({
    where: { status: "published", deletedAt: null },
    include: {
      artist: { select: { slug: true, user: { select: { name: true } } } },
      media: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return artworks.map(flatten);
}

export async function listFeaturedArtworks(limit = 4): Promise<ArtworkCard[]> {
  const all = await listPublishedArtworks();
  return all.slice(0, limit);
}
