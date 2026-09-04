import Link from "next/link";
import type { ArtworkAuctionBadge, ArtworkCard } from "@/lib/artworks";
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
 */
export function ArtworkTile({ artwork, className }: { artwork: ArtworkCard; className?: string }) {
  return (
    <Link
      href={`/artists/${artwork.artistSlug}`}
      className={cn(
        "group relative block border-2 border-ink bg-paper transition-[transform,box-shadow] duration-200",
        "shadow-[0_0_0_rgba(22,19,17,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(22,19,17,1)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b-2 border-ink bg-paper-deep">
        {artwork.image && (
          // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
          <img
            src={artwork.image}
            alt={artwork.alt ?? artwork.title}
            loading="lazy"
            className="h-full w-full object-cover"
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

      <div className="space-y-1 p-4">
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
      </div>
    </Link>
  );
}
