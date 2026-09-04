import type { Metadata } from "next";
import Link from "next/link";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
import { CollageHero } from "@/components/sections/CollageHero";
import { ShowcaseCarousel } from "@/components/carousel/ShowcaseCarousel";
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
import { listEvents } from "@/lib/ticketing-events";
import {
  AVAILABILITY_LABEL,
  interleaveShowcaseSeeds,
  type ShowcaseSeed,
} from "@/lib/showcase";

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
 * → THE MAIN WALL (3D ring of art/events/causes) → artist spotlight →
 * journal coverflow → causes → how-it-works → statement → openings. The
 * hero's collage assembly is this page's ONE pinned/scrubbed centerpiece;
 * the Main Wall's ring is drag-driven, not scrub-driven.
 */
export default async function Home() {
  const [featured, ticketingEvents, events, artists, posts, causes] = await Promise.all([
    listFeaturedArtworks(5),
    listEvents(),
    listPublishedEvents(),
    listPublishedArtists(),
    listPublishedPosts(6),
    listPublishedCauseCards(),
  ]);

  const showcaseItems = interleaveShowcaseSeeds({
    art: featured.map((a): ShowcaseSeed => ({
      key: `art-${a.id}`,
      kind: "art",
      title: a.title,
      subtitle: a.artistName,
      image: a.image,
      imageAlt: a.alt ?? a.title,
      href: `/artists/${a.artistSlug}`,
    })),
    events: ticketingEvents.map((e): ShowcaseSeed => ({
      key: `event-${e.id}`,
      kind: "event",
      title: e.title,
      subtitle: `${e.venue} · ${AVAILABILITY_LABEL[e.availability]}`,
      image: e.coverImage,
      imageAlt: `${e.title} — event cover`,
      href: `/events/${e.slug}`,
    })),
    causes: causes.map((c): ShowcaseSeed => ({
      key: `cause-${c.id}`,
      kind: "cause",
      title: c.title,
      subtitle: `${c.country ?? "East Africa"} · ${c.progressPercent}% funded`,
      image: c.coverImage,
      imageAlt: `${c.title} — cause cover`,
      href: c.donatePath,
    })),
  });

  return (
    <>
      <FloatingNavbar />

      <main>
        <CollageHero />

        <TickerBand artworks={featured} events={events} />

        <ShowcaseCarousel items={showcaseItems} />

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
