import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ArtworkAuctionBadge, ArtworkCard } from "@/lib/artworks";
import { ArtCaptionPress } from "@/components/art/ArtCaption";
import { cn, formatKes } from "@/lib/format";

export const AVAILABILITY_LABEL: Record<ArtworkCard["availability"], string> = {
  available: "Available",
  low: "Last one",
  sold: "Sold",
};

export const AVAILABILITY_CLASS: Record<ArtworkCard["availability"], string> = {
  available: "bg-cobalt text-paper",
  low: "bg-coral text-ink",
  sold: "bg-ink/60 text-paper",
};

export const AUCTION_LABEL: Record<ArtworkAuctionBadge["status"], string> = {
  scheduled: "Auction soon",
  active: "Live auction",
  sold: "Sold at auction",
};

export const AUCTION_CLASS: Record<ArtworkAuctionBadge["status"], string> = {
  scheduled: "bg-paper text-ink",
  active: "bg-coral text-ink",
  sold: "bg-ink text-paper",
};

/**
 * The vector-lane artwork tile (docs/11 Phase 3): flat fills, sharp
 * paper edges, a 2px ink rule, and an offset-print hover shadow — no
 * glass, no gradients. Used by both the homepage band (RSC) and the
 * client-side browse grid.
 *
 * Pressing the artwork opens its caption — an African proverb or quote
 * beside the piece (see ArtCaptionPress); the title block stays the link
 * into the artist's studio.
 */
export function ArtworkTile({ artwork, className }: { artwork: ArtworkCard; className?: string }) {
  const captionTarget = {
    slug: artwork.slug,
    title: artwork.title,
    artistName: artwork.artistName,
    artistSlug: artwork.artistSlug,
    image: artwork.image,
    imageAlt: artwork.alt ?? null,
    medium: artwork.medium,
    yearCreated: artwork.yearCreated,
  };

  return (
    <div
      className={cn(
        "group relative border-2 border-ink bg-paper transition-[transform,box-shadow] duration-200",
        "shadow-[0_0_0_var(--ac-shadow-ink)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ac-shadow-ink)]",
        className,
      )}
    >
      <ArtCaptionPress target={captionTarget}>
        <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink bg-paper-deep">
          {artwork.image && (
            <Image
              src={artwork.image}
              alt={artwork.alt ?? artwork.title}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          )}
          <span
            className={cn(
              "absolute left-2 top-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
              AVAILABILITY_CLASS[artwork.availability],
            )}
          >
            {AVAILABILITY_LABEL[artwork.availability]}
          </span>
          {artwork.auction && (
            <span
              className={cn(
                "absolute right-2 top-2 border-2 border-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                AUCTION_CLASS[artwork.auction.status],
              )}
            >
              {AUCTION_LABEL[artwork.auction.status]}
            </span>
          )}
        </div>
      </ArtCaptionPress>

      <Link
        href={`/artists/${artwork.artistSlug}`}
        className="group/link block space-y-1 p-4 transition-colors hover:bg-paper-deep active:bg-paper-deep"
        aria-label={`${artwork.title} by ${artwork.artistName} — visit the studio`}
      >
        <h3 className="text-base font-semibold leading-snug text-ink">{artwork.title}</h3>
        <p className="text-sm text-ink/60">{artwork.artistName}</p>
        <div className="flex items-baseline justify-between gap-2 pt-1">
          <span className="text-xs text-ink/50">
            {[artwork.medium, artwork.yearCreated].filter(Boolean).join(" · ")}
          </span>
          {artwork.priceMinor !== null && artwork.currency && (
            <span className="text-sm font-bold text-cobalt">
              {formatKes(artwork.priceMinor, artwork.currency)}
            </span>
          )}
        </div>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-ink/0 transition-colors duration-200 group-hover/link:text-cobalt">
          Visit studio
          <ArrowRight size={12} aria-hidden />
        </span>
      </Link>
    </div>
  );
}
