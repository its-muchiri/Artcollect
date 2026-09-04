import "server-only";
import { prisma } from "@artcollect/database";

/**
 * Art-sale auctions. Status is never read off the database — it's derived
 * from `startsAt`/`endsAt` against the current time (see the schema
 * comment on `ArtworkAuction`), so it's always correct on every request
 * with no scheduler required to keep it up to date.
 */

export type AuctionStatus = "scheduled" | "active" | "sold";

export interface AuctionCard {
  id: string;
  artworkSlug: string;
  artworkTitle: string;
  artistName: string;
  artistSlug: string;
  image: string | null;
  alt: string | null;
  startsAt: string;
  endsAt: string;
  startingPriceMinor: number;
  currency: string;
  status: AuctionStatus;
}

export function auctionStatus(startsAt: Date, endsAt: Date, now: Date = new Date()): AuctionStatus {
  if (now < startsAt) return "scheduled";
  if (now < endsAt) return "active";
  return "sold";
}

export async function listAuctions(): Promise<AuctionCard[]> {
  const auctions = await prisma.artworkAuction.findMany({
    include: {
      artwork: {
        include: {
          artist: { select: { slug: true, user: { select: { name: true } } } },
          media: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });

  const now = new Date();
  return auctions.map((auction) => {
    const primaryMedia = auction.artwork.media[0];
    return {
      id: auction.id,
      artworkSlug: auction.artwork.slug,
      artworkTitle: auction.artwork.title,
      artistName: auction.artwork.artist.user?.name ?? "Unknown artist",
      artistSlug: auction.artwork.artist.slug,
      image: primaryMedia?.storageKey ?? null,
      alt: primaryMedia?.altText ?? null,
      startsAt: auction.startsAt.toISOString(),
      endsAt: auction.endsAt.toISOString(),
      startingPriceMinor: Number(auction.startingPriceMinor),
      currency: auction.currency,
      status: auctionStatus(auction.startsAt, auction.endsAt, now),
    };
  });
}

/** Keyed by artwork slug, for tiles/cards that need to badge one artwork's auction state. */
export async function listAuctionsByArtworkSlug(): Promise<Map<string, AuctionCard>> {
  const auctions = await listAuctions();
  return new Map(auctions.map((auction) => [auction.artworkSlug, auction]));
}
