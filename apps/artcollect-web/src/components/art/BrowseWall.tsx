"use client";

import { useMemo, useState } from "react";
import type { ArtworkCard, ArtworkKind } from "@/lib/artworks";
import { ArtworkTile } from "@/components/art/ArtworkTile";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import {
  Camera,
  PaintBrush,
  Printer,
  Scissors,
  Sparkle,
  SquaresFour,
  type Icon,
} from "@/components/icons";
import { cn } from "@/lib/format";

/**
 * Client-side filtering for the vector-art browse wall (docs/11 Phase 3).
 * Data comes fully server-rendered; filtering is a plain local state pass
 * — no fetch, no suspense, no layout shift (grid reflows only).
 */

const FILTERS: { kind: ArtworkKind | "all"; label: string; Icon: Icon }[] = [
  { kind: "all", label: "Everything", Icon: SquaresFour },
  { kind: "collage", label: "Collage", Icon: Scissors },
  { kind: "print", label: "Editions & prints", Icon: Printer },
  { kind: "photography", label: "Photography", Icon: Camera },
  { kind: "painting", label: "Painting", Icon: PaintBrush },
  { kind: "other", label: "Other", Icon: Sparkle },
];

export function BrowseWall({ artworks }: { artworks: ArtworkCard[] }) {
  const [filter, setFilter] = useState<ArtworkKind | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? artworks : artworks.filter((a) => a.kind === filter)),
    [artworks, filter],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter artworks by kind">
        {FILTERS.map(({ kind, label, Icon }) => (
          <button
            key={kind}
            type="button"
            aria-pressed={filter === kind}
            onClick={() => setFilter(kind)}
            className={cn(
              "inline-flex items-center gap-1.5 border-2 border-ink px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-150",
              filter === kind ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-deep",
            )}
          >
            <Icon size={14} weight="bold" aria-hidden />
            {label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-ink/50" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "work" : "works"}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 border-2 border-dashed border-ink/30 p-16 text-center">
          <p className="font-display text-2xl text-ink">Nothing hung here yet</p>
          <p className="mt-2 text-sm text-ink/60">
            No works in this category yet — try another kind of wall.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((artwork, i) => (
            <RevealOnScroll key={artwork.id} index={i % 6}>
              <ArtworkTile artwork={artwork} />
            </RevealOnScroll>
          ))}
        </div>
      )}
    </div>
  );
}
