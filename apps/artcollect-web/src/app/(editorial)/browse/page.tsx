import type { Metadata } from "next";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
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
    </main>
  );
}
