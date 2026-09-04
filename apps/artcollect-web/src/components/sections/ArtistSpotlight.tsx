import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Annotation, TapePiece } from "@artcollect/ui";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { profileQuote, type ArtistCard } from "@/lib/artists";

/**
 * Homepage artist spotlight band (docs/11 Phase 4): the handwritten lane
 * at homepage scale — one portrait, real margin notes, one link into the
 * profile. Motion stays deliberately calm — a single fade/slide-up
 * entrance on each half, no scrub, no parallax — a quiet beat between the
 * louder sections around it, not a still one.
 */
export function ArtistSpotlight({ artist }: { artist: ArtistCard }) {
  const quote = profileQuote(artist.tagline, artist.bio);

  return (
    <section id="artists" className="relative z-10 border-y-2 border-ink bg-ink">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-[var(--ac-gutter)] py-20 lg:grid-cols-[2fr_3fr]">
        {/* Portrait scrap, taped to the dark wall */}
        <RevealOnScroll className="relative mx-auto w-full max-w-xs lg:mx-0">
          <div className="relative border-2 border-paper bg-paper-deep shadow-[6px_6px_0_rgba(245,241,232,0.9)]" style={{ rotate: "2deg" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery */}
            <img
              src={artist.portraitUrl}
              alt={`Portrait of ${artist.name}`}
              loading="lazy"
              className="block aspect-[4/5] w-full object-cover"
            />
            <TapePiece className="-top-3 left-1/2 w-24 -translate-x-1/2" angle={3} />
          </div>
          <div className="absolute -bottom-4 left-4">
            <Annotation tone="night">{artist.location ?? "Nairobi"} →</Annotation>
          </div>
        </RevealOnScroll>

        <RevealOnScroll index={1}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime">
            In the studio this week
          </p>
          <h2 className="mt-3 font-display text-4xl text-paper sm:text-6xl">
            {artist.name.toUpperCase()}
          </h2>

          {quote && (
            <div className="mt-6">
              <Annotation tone="neon" className="text-xl sm:text-2xl">
                “{quote}”
              </Annotation>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href={`/artists/${artist.slug}`}
              className="group inline-flex items-center gap-2 rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-lime"
            >
              Step into the studio
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <span className="text-sm text-paper/60">
              {artist.artworkCount} {artist.artworkCount === 1 ? "work" : "works"} on the wall
            </span>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
