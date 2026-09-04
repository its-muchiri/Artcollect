import type { Metadata } from "next";
import Link from "next/link";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
import { CollageHero } from "@/components/sections/CollageHero";
import { Corkboard } from "@/components/sections/Corkboard";
import { TickerBand } from "@/components/sections/TickerBand";
import { JournalBand } from "@/components/sections/JournalBand";
import { CausesBand } from "@/components/sections/CausesBand";
import { ArtistSpotlight } from "@/components/sections/ArtistSpotlight";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { EventsBand } from "@/components/sections/EventsBand";
import { TornEdge } from "@artcollect/ui";
import { listFeaturedArtworks } from "@/lib/artworks";
import { listPublishedArtists } from "@/lib/artists";
import { listPublishedPosts } from "@/lib/posts";
import { listPublishedCauseCards } from "@/lib/causes";
import { listPublishedEvents } from "@/lib/events";
import { toCorkboardPieces } from "@/components/sections/corkboard-data";

export const metadata: Metadata = {
  title: "ArtCollect — Collect the work you can't stop thinking about",
  description:
    "Originals and small editions from East African artists, openings you can attend, and tickets handed off to TikoYetu.",
};

// Availability, prices, and events change with real activity; render
// per-request rather than caching a snapshot.
export const dynamic = "force-dynamic";

/**
 * v2 homepage composition (docs/11 + continuation): hero collage → ticker
 * → corkboard → artist spotlight → journal → causes → how-it-works →
 * statement → openings. The hero's collage assembly is this page's ONE
 * pinned/scrubbed centerpiece; one dominant style per section, one
 * shared grid.
 */
export default async function Home() {
  const [featured, events, artists, posts, causes] = await Promise.all([
    listFeaturedArtworks(4),
    listPublishedEvents(),
    listPublishedArtists(),
    listPublishedPosts(3),
    listPublishedCauseCards(),
  ]);

  return (
    <>
      <FloatingNavbar />

      <main>
        <CollageHero />

        <TickerBand artworks={featured} events={events} />

        <Corkboard pieces={toCorkboardPieces(featured)} />

        {artists[0] && <ArtistSpotlight artist={artists[0]} />}

        <JournalBand posts={posts} />

        <CausesBand causes={causes} />

        <HowItWorks />

        {/* Editorial statement — Inter-only section, the calm between the
            louder vector bands around it. */}
        <section className="relative z-10 bg-paper">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-[var(--ac-gutter)] py-24 sm:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="font-display text-3xl leading-tight text-ink sm:text-5xl">
                A gallery that behaves like a studio wall
              </h2>
            </div>
            <div className="space-y-5 text-base text-ink/75">
              <p>
                Work arrives here the way it exists in the studio: taped,
                stapled, annotated, mid-thought. Every piece is published by
                the artist who made it — original, edition, or print — with
                the story of how it was made kept attached.
              </p>
              <p>
                When a show opens, the opening lives here too. Tickets are
                sold by{" "}
                <Link
                  href="/events"
                  className="font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink"
                >
                  TikoYetu
                </Link>
                , our ticketing arm — clear prices, real availability, QR
                tickets the moment payment confirms.
              </p>
            </div>
          </div>
          <TornEdge className="h-5 w-full text-coral" seed={23} intensity={10} />
        </section>

        <EventsBand events={events} />
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-16">
        <div className="flex flex-col items-start justify-between gap-4 border-t-2 border-ink pt-8 sm:flex-row sm:items-center">
          <span className="font-display text-xl text-ink">ARTCOLLECT</span>
          <p className="text-sm text-ink/60">
            Art by East African artists · Tickets &amp; donations by TikoYetu · Nairobi
          </p>
        </div>
      </footer>
    </>
  );
}
