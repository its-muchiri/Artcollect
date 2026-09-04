"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StapleMark, TapePiece, TornEdge } from "@artcollect/ui";
import { type CorkboardPiece } from "./corkboard-data";
import { cn, formatKes } from "@/lib/format";

/**
 * The corkboard carousel (docs/11 Phase 7): "recent drops" pinned to a
 * studio corkboard — a horizontally scrollable, scroll-snap row of taped
 * and stapled photo cards. Scrolling is NATIVE (overflow-x + snap) — no
 * JS scroll loop, no scrub, nothing fighting Lenis; the arrow buttons
 * just call scrollBy. Below the tablet breakpoint the same row simply
 * scrolls natively (no special-casing needed).
 */

function PeelCard({ piece, index }: { piece: CorkboardPiece; index: number }) {
  return (
    <Link
      href={`/artists/${piece.artistSlug}`}
      className={cn(
        "group relative block w-64 shrink-0 snap-center sm:w-72",
        "transition-transform duration-200 hover:z-10 hover:-translate-y-1.5 focus-visible:-translate-y-1.5",
      )}
      style={{ rotate: `${piece.tilt}deg` }}
    >
      <div className="relative border-2 border-ink bg-paper p-2 shadow-[4px_4px_0_rgba(var(--ac-shadow-rgb),0.85)]">
        {/* Sticker-peel corner: a folded sticker that lifts on hover
            (clip-path + scale, transform-only). */}
        <span
          aria-hidden
          className="absolute right-0 top-0 z-20 h-10 w-10 origin-top-right bg-highlighter transition-all duration-200 group-hover:scale-125 group-hover:rotate-3"
          style={{
            clipPath: "polygon(0 0, 100% 100%, 100% 0)",
            boxShadow: "-2px 2px 5px rgba(var(--ac-shadow-rgb),0.3)",
          }}
        />

        <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
          {piece.image && (
            // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
            <img
              src={piece.image}
              alt={piece.alt}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex items-start justify-between gap-3 px-2 pb-1 pt-3">
          <div>
            <h3 className="text-sm font-semibold leading-snug text-ink">{piece.title}</h3>
            <p className="mt-0.5 text-xs text-ink/60">{piece.artistName}</p>
          </div>
          {/* Price: plain Inter text, never conveyed by styling alone. */}
          <span className="shrink-0 text-sm font-bold text-cobalt">
            {formatKes(piece.priceMinor, piece.currency)}
          </span>
        </div>

        {index % 2 === 0 ? (
          <TapePiece className="-top-3 left-1/2 w-20 -translate-x-1/2" angle={index % 4 === 0 ? -6 : 4} />
        ) : (
          <StapleMark className="absolute -top-2 right-4" angle={index % 3 === 0 ? 14 : -10} />
        )}
      </div>
    </Link>
  );
}

export function Corkboard({ pieces }: { pieces: CorkboardPiece[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCards(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * 320, behavior: "smooth" });
  }

  if (pieces.length === 0) return null;

  return (
    <section id="collection" className="relative z-10 bg-paper">
      <TornEdge className="h-4 w-full text-paper-deep" seed={41} intensity={8} />
      <div className="bg-paper-deep pb-14 pt-4">
        <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
                Pinned this week
              </p>
              <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
                RECENT DROPS
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Scroll the corkboard left"
                onClick={() => scrollByCards(-1)}
                className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper font-display text-lg text-ink transition-[colors,transform] hover:bg-ink hover:text-paper active:translate-y-0.5"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Scroll the corkboard right"
                onClick={() => scrollByCards(1)}
                className="flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper font-display text-lg text-ink transition-[colors,transform] hover:bg-ink hover:text-paper active:translate-y-0.5"
              >
                →
              </button>
              <Link
                href="/browse"
                className="group ml-2 inline-flex items-center gap-2 border-2 border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
              >
                Browse all
                <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory gap-8 overflow-x-auto pb-6 pt-4 [scrollbar-width:thin]"
          >
            {pieces.map((piece, i) => (
              <PeelCard key={piece.id} piece={piece} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
