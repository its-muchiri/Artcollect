import { ArrowRight, Heart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { BrowseWall } from "@/components/art/BrowseWall";
import { TornEdge } from "@artcollect/ui";
import { listPublishedArtworks } from "@/lib/artworks";

export const metadata: Metadata = {
  title: "Browse the wall — ArtCollect",
  description: "Every published work on ArtCollect: originals, editions, and prints from East African artists.",
};

// Artwork availability changes with purchases; render per-request.
export const dynamic = "force-dynamic";

/**
 * The vector-lane browse wall (docs/11 Phase 3). Dominant style: vector
 * (flat tiles, sharp edges, cobalt/coral accents); no secondary style
 * stacked on top; all copy — titles, prices, availability — set in Inter.
 */
export default async function BrowsePage() {
  const artworks = await listPublishedArtworks();

  return (
    <main className="min-h-screen bg-paper">
      <FloatingNavbar />
      <header className="border-b-2 border-ink bg-paper">
        <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] pb-10 pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
            The wall, top to bottom
          </p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-7xl">BROWSE THE WALL</h1>
          <p className="mt-4 max-w-[var(--ac-measure)] text-base text-ink/70">
            Everything published on ArtCollect, straight from the artists —
            originals and small editions first, with the story of each piece
            kept attached. Availability is live; when something&apos;s gone,
            it&apos;s gone.
          </p>
        </div>
        <TornEdge className="h-4 w-full text-coral" seed={17} />
      </header>

      <section className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-12">
        <BrowseWall artworks={artworks} />
      </section>

        {/* Donate call-to-action - hands off to TikoYetu payment */}
        <section className="relative z-10 border-y-2 border-ink bg-coral py-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-[var(--ac-gutter)] sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl text-ink sm:text-3xl">Back a cause today</h2>
              <p className="mt-1 max-w-xl text-sm text-ink/70">
                Community murals, print workshops, materials funds. Every shilling is receipted.
              </p>
            </div>
            <Link
              href="/donate"
              className="inline-flex shrink-0 items-center gap-2 bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:scale-105 active:scale-95"
            >
              <Heart size={16} aria-hidden />
              Donate now
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </section>      <PartnersMarquee compact />
    </main>
  );
}
