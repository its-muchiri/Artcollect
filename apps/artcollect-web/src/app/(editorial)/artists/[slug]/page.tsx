import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Annotation, HighlighterMark, StapleMark, TapePiece } from "@artcollect/ui";
import { ArtworkTile } from "@/components/art/ArtworkTile";
import { ShareLinkButton } from "@/components/ShareLinkButton";
import { HorizontalGallery } from "@/components/sections/HorizontalGallery";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { getArtistBySlug, profileQuote } from "@/lib/artists";
import { ensureShortLink } from "@/lib/short-links";
import { cn } from "@/lib/utils";

// Profiles and availability change; render per-request.
export const dynamic = "force-dynamic";

/**
 * Artist profile (docs/11 Phase 4, extended): the handwritten annotation
 * system over portrait/work photography, plus discipline badges, a
 * practice breakdown, and (where the artist actually has them — see
 * lib/artists.ts) a milestones timeline and collaborations list. Sections
 * an artist doesn't have real content for simply don't render; nothing on
 * this page is ever a filled-in placeholder standing in for a fact no one
 * verified.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Artist not found — ArtCollect" };
  return {
    title: `${artist.name} — ArtCollect`,
    description: artist.tagline ?? artist.bio ?? undefined,
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();
  const shareCode = await ensureShortLink(`/artists/${artist.slug}`);

  const quote = profileQuote(artist.tagline, artist.bio);
  const notes: { text: string; className: string; tone: "marker" | "ink" | "lime" | "pink" | "highlight" }[] = [
    {
      text: artist.location ? `works from ${artist.location} →` : "studio notes →",
      className: "left-[2%] top-[46%]",
      tone: "highlight",
    },
    {
      text: "everything here is cut by hand",
      className: "right-[3%] top-[30%]",
      tone: "marker",
    },
    {
      text: "say hi about a piece ↓",
      className: "right-[5%] top-[74%]",
      tone: "lime",
    },
  ];

  // Person rich-snippet data (technical SEO): only fields this profile
  // actually has — no invented job title or fabricated social links.
  const personStructuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: artist.name,
    description: artist.tagline ?? artist.bio ?? undefined,
    image: artist.portraitUrl,
    address: artist.location ? { "@type": "PostalAddress", addressLocality: artist.location } : undefined,
    url: artist.websiteUrl ?? undefined,
    jobTitle: "Artist",
  };

  return (
    <main className="min-h-screen bg-paper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personStructuredData) }}
      />
      <FloatingNavbar />
      {/* Profile header: portrait + handwritten margin system */}
      <header className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] pb-16 pt-24">
          <Link
            href="/artists"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cobalt hover:text-ink"
          >
            <ArrowLeft size={15} />
            All artists
          </Link>

          <div className="mt-8 grid grid-cols-1 items-start gap-12 lg:grid-cols-[2fr_3fr]">
            {/* Portrait with tape + staple + margin notes */}
            <div className="relative mx-auto w-full max-w-sm lg:mx-0">
              <div className="relative border-2 border-ink bg-paper-deep shadow-[6px_6px_0_var(--ac-shadow-ink)]" style={{ rotate: "-1.5deg" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery */}
                <img
                  src={artist.portraitUrl}
                  alt={`Portrait of ${artist.name}`}
                  className="block aspect-[4/5] w-full object-cover"
                />
                <TapePiece className="-top-3 left-1/2 w-24 -translate-x-1/2" angle={-4} />
                <StapleMark className="absolute right-3 top-3" angle={12} />
              </div>

              {/* These read as margin notes only where the layout actually
                  has margin to spare (the two-column desktop grid) —
                  below `lg` the portrait fills the whole column, so the
                  same percentages would sit on top of the photo instead
                  of beside it. */}
              {notes.map((note) => (
                <div key={note.text} className={`absolute hidden lg:block ${note.className}`}>
                  <Annotation tone={note.tone}>{note.text}</Annotation>
                </div>
              ))}
            </div>

            {/* Name, disciplines, quote, bio */}
            <div className="pt-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
                Artist profile · {artist.artworkCount} {artist.artworkCount === 1 ? "work" : "works"} on the wall
              </p>
              <h1 className="mt-3 font-display text-5xl text-ink sm:text-7xl">
                {artist.name.toUpperCase()}
              </h1>

              {artist.disciplines.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {artist.disciplines.map((d) => (
                    <span
                      key={d.name}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
                        d.tier === "primary" ? "bg-ink text-paper" : "border-2 border-ink text-ink",
                      )}
                    >
                      {d.emoji && <span className="mr-1">{d.emoji}</span>}
                      {d.name}
                    </span>
                  ))}
                </div>
              )}

              {quote && (
                <div className="mt-8 inline-block max-w-xl">
                  <Annotation tone="highlight" rotate={-1} className="text-2xl sm:text-3xl">
                    “{quote}”
                  </Annotation>
                </div>
              )}

              {artist.bio && (
                <p className="mt-8 max-w-[var(--ac-measure)] text-base leading-relaxed text-ink/75">
                  {artist.bio}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#works"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-coral hover:text-ink"
                >
                  <HighlighterMark color="rgba(242,223,79,0.55)">
                    <span className="text-paper">See the works</span>
                  </HighlighterMark>
                </a>
                {artist.websiteUrl && (
                  <a
                    href={artist.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-ink px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                  >
                    Artist&apos;s site
                  </a>
                )}
                <ShareLinkButton code={shareCode} title={`${artist.name} — on ArtCollect`} label="Share profile" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* The practice — discipline descriptions, only for artists who have them */}
      {artist.disciplines.some((d) => d.description) && (
        <section className="border-b-2 border-ink bg-paper-deep">
          <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-16">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl text-ink sm:text-4xl">THE PRACTICE</h2>
              <Annotation tone="marker" rotate={1}>
                primary disciplines first →
              </Annotation>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {artist.disciplines
                .filter((d) => d.description)
                .map((d, i) => (
                  <RevealOnScroll key={d.name} index={i}>
                    <div className="h-full border-2 border-ink bg-paper p-6 shadow-[4px_4px_0_var(--ac-shadow-ink)]">
                      <p className="text-2xl">{d.emoji}</p>
                      <h3 className="mt-2 font-display text-xl text-ink">{d.name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink/70">{d.description}</p>
                      <span
                        className={cn(
                          "mt-4 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide",
                          d.tier === "primary" ? "bg-ink text-paper" : "border border-ink/40 text-ink/60",
                        )}
                      >
                        {d.tier}
                      </span>
                    </div>
                  </RevealOnScroll>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Works — its own vector-dominant section */}
      <section id="works" className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">ON THE WALL</h2>
          <Annotation tone="ink" rotate={1}>
            prices in the corner of each card →
          </Annotation>
        </div>

        {artist.artworks.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-16 text-center">
            <p className="font-display text-2xl text-ink">Nothing hung yet</p>
            <p className="mt-2 text-sm text-ink/60">
              {artist.name.split(" ")[0]} hasn&apos;t published work yet — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artist.artworks.map((artwork, i) => (
              <RevealOnScroll key={artwork.id} index={i % 6}>
                <ArtworkTile artwork={artwork} />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </section>

      {/* Milestones — only for artists with a real, supplied timeline */}
      {artist.timeline.length > 0 && (
        <section className="border-y-2 border-ink bg-paper-deep">
          <div className="mx-auto w-full max-w-4xl px-[var(--ac-gutter)] py-16">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl text-ink sm:text-4xl">MILESTONES</h2>
              <Annotation tone="lime" rotate={-1}>
                most recent first ↑
              </Annotation>
            </div>
            <ol className="space-y-8 border-l-2 border-ink pl-8">
              {artist.timeline.map((entry, i) => (
                <li key={`${entry.year}-${entry.title}`} className="relative">
                  <span className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-coral ring-4 ring-paper-deep" />
                  <RevealOnScroll index={i}>
                    <span className="font-display text-2xl text-cobalt">{entry.year}</span>
                    <h3 className="mt-1 text-lg font-semibold text-ink">{entry.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink/70">{entry.description}</p>
                  </RevealOnScroll>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Collaborations — only for artists with real, supplied projects */}
      {artist.collaborations.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-16">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl text-ink sm:text-4xl">COLLABORATIONS</h2>
            <Annotation tone="pink" rotate={1}>
              ongoing, not archived →
            </Annotation>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {artist.collaborations.map((collab, i) => (
              <RevealOnScroll key={collab.title} index={i}>
                <div className="h-full border-2 border-ink bg-paper p-6">
                  <h3 className="font-display text-lg text-ink">{collab.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{collab.description}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      )}

      {/* Studio-floor photo dump — the relocated pinned horizontal track
          (docs/11 Phase 7). This page's ONE pinned centerpiece; renders as
          a plain scrollable row under reduced motion / below tablet. */}
      <HorizontalGallery
        eyebrow="From the studio floor"
        title="THE PHOTO DUMP"
        note="taped up exactly as they came off the wall →"
        pieces={artist.artworks.slice(0, 6).map((artwork) => ({
          title: artwork.title,
          caption: [artwork.medium, artwork.yearCreated].filter(Boolean).join(", ") || "Studio shot",
          image: artwork.image ?? "",
          alt: artwork.alt ?? `${artwork.title} by ${artist.name}`,
        }))}
      />
    </main>
  );
}
