import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Annotation, TapePiece } from "@artcollect/ui";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { listPublishedArtists } from "@/lib/artists";

export const metadata: Metadata = {
  title: "Artists — ArtCollect",
  description: "The East African artists behind every work on ArtCollect.",
};

// Profiles publish/unpublish from the studio; render per-request.
export const dynamic = "force-dynamic";

/**
 * Artist index (docs/11 Phase 4). Dominant style: handwritten annotations
 * over portrait photography; the calm Inter index copy keeps it legible.
 */
export default async function ArtistsPage() {
  const artists = await listPublishedArtists();

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] pb-10 pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
            The people holding the scissors
          </p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-7xl">ARTISTS</h1>
          <p className="mt-4 max-w-[var(--ac-measure)] text-base text-ink/70">
            Every piece on ArtCollect is published by the artist who made it.
            Their walls, their words.
          </p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-14">
        {artists.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-16 text-center">
            <p className="font-display text-2xl text-ink">No published artists yet</p>
            <p className="mt-2 text-sm text-ink/60">
              Artist profiles appear here the moment they publish.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist, i) => (
              <RevealOnScroll key={artist.id} index={i % 6}>
                <Link
                  href={`/artists/${artist.slug}`}
                  className="group relative block border-2 border-ink bg-paper shadow-[0_0_0_rgba(22,19,17,1)] transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[5px_5px_0_rgba(22,19,17,1)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-ink bg-paper-deep">
                    {/* Placeholder portrait (docs/11 assumption #1). */}
                    {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery */}
                    <img
                      src={artist.portraitUrl}
                      alt={`Portrait of ${artist.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <TapePiece
                      className="-top-3 left-1/2 w-20 -translate-x-1/2"
                      angle={i % 2 === 0 ? -5 : 4}
                    />
                    <div className="absolute bottom-3 right-3">
                      <Annotation tone={i % 2 === 0 ? "lime" : "pink"} rotate={i % 2 === 0 ? 2 : -2.5}>
                        {artist.artworkCount} {artist.artworkCount === 1 ? "work" : "works"} up
                      </Annotation>
                    </div>
                  </div>
                  <div className="flex items-start justify-between gap-3 p-4">
                    <div>
                      <h2 className="text-lg font-semibold text-ink">{artist.name}</h2>
                      {artist.location && (
                        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink/60">
                          <MapPin size={14} aria-hidden />
                          {artist.location}
                        </p>
                      )}
                    </div>
                    <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-cobalt">
                      Visit studio
                      <ArrowRight
                        size={15}
                        className="transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </Link>
              </RevealOnScroll>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
