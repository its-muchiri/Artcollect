import type { ArtworkCard } from "@/lib/artworks";

export interface CorkboardPiece {
  id: string;
  title: string;
  artistName: string;
  artistSlug: string;
  image: string | null;
  alt: string;
  priceMinor: number;
  currency: string;
  /** Per-card paper tilt, degrees. */
  tilt: number;
}

/** Deterministic scrap-like tilts — pinned photos are never straight. */
const TILTS = [-2.5, 1.8, -1.2, 2.6, -1.8, 1.4];

export function toCorkboardPieces(artworks: ArtworkCard[]): CorkboardPiece[] {
  return artworks
    .filter((a) => a.priceMinor !== null && a.currency !== null)
    .map((artwork, i) => ({
      id: artwork.id,
      title: artwork.title,
      artistName: artwork.artistName,
      artistSlug: artwork.artistSlug,
      image: artwork.image,
      alt: artwork.alt ?? artwork.title,
      priceMinor: artwork.priceMinor ?? 0,
      currency: artwork.currency ?? "KES",
      tilt: TILTS[i % TILTS.length] ?? 0,
    }));
}
