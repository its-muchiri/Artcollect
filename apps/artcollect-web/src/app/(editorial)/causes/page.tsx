import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Annotation, StapleMark, TapePiece, TornEdge } from "@artcollect/ui";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { listPublishedCauseCards } from "@/lib/causes";
import { formatKes } from "@/lib/format";

export const metadata: Metadata = {
  title: "Art causes — ArtCollect",
  description: "Fund community murals, print workshops, and materials for art programs across Africa. Clear goals, published receipts.",
};

// Progress changes with every donation; render per-request.
export const dynamic = "force-dynamic";

/**
 * Causes (collage-lane editorial, docs/11 style map): cause cards as
 * taped-up scraps with live progress; the donate action hands off to
 * TikoYetu — ArtCollect never computes payment state (docs/08).
 */
export default async function CausesPage() {
  const causes = await listPublishedCauseCards();

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] pb-10 pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
            Small amounts, public receipts
          </p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-7xl">
            SUPPORT THE WALLS
          </h1>
          <p className="mt-4 max-w-[var(--ac-measure)] text-base text-ink/70">
            Community murals, print workshops, materials funds — the causes
            keeping African art public. Every cause publishes what a
            donation buys. Checkout runs on{" "}
            <Link href="/events" className="font-semibold text-cobalt underline decoration-2 underline-offset-4 hover:text-ink">
              TikoYetu
            </Link>
            , the same verified flow as our tickets.
          </p>
          <div className="mt-6">
            <Annotation tone="pink" withTape>
              twenty bob counts — see the maths below ↓
            </Annotation>
          </div>
        </div>
        <TornEdge className="h-4 w-full text-coral" seed={53} />
      </header>

      <section className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-14">
        {causes.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-16 text-center">
            <p className="font-display text-2xl text-ink">No open causes yet</p>
            <p className="mt-2 text-sm text-ink/60">
              New causes are announced here first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            {causes.map((cause, i) => (
              <RevealOnScroll
                key={cause.id}
                index={i}
                as="article"
                className="relative border-2 border-ink bg-paper p-4 shadow-[5px_5px_0_rgba(22,19,17,1)]"
                style={{ rotate: `${i % 2 === 0 ? -0.8 : 0.9}deg` }}
              >
                <div className="relative aspect-[16/9] overflow-hidden border-2 border-ink bg-paper-deep">
                  {cause.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                    <img
                      src={cause.coverImage}
                      alt={cause.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <StapleMark className="absolute right-4 top-4" angle={i % 2 === 0 ? 8 : -12} />

                <div className="p-3">
                  <h2 className="font-display text-2xl text-ink">{cause.title}</h2>
                  <p className="mt-1 text-sm text-ink/60">
                    {cause.country ?? "East Africa"} · run by {cause.organiserName}
                  </p>
                  <p className="mt-3 text-base text-ink/75">{cause.summary}</p>

                  <div className="mt-5">
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-bold text-ink">
                        {formatKes(cause.raisedMinor, cause.currency)}
                      </span>
                      <span className="text-ink/50">
                        of {formatKes(cause.goalMinor, cause.currency)} goal
                      </span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden border border-ink/20 bg-paper-deep">
                      <div
                        className="h-full bg-coral"
                        style={{ width: `${cause.progressPercent}%` }}
                        role="progressbar"
                        aria-valuenow={cause.progressPercent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${cause.title} funding progress`}
                      />
                    </div>
                    <p className="mt-2 text-xs text-ink/50">
                      {cause.progressPercent}% funded · {cause.donorCount}{" "}
                      {cause.donorCount === 1 ? "supporter" : "supporters"}
                    </p>
                  </div>

                  <Link
                    href={cause.donatePath}
                    className="group mt-6 inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-coral hover:text-ink"
                  >
                    <Heart size={15} aria-hidden />
                    Donate on TikoYetu
                    <ArrowRight
                      size={15}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>

                <TapePiece className="-top-3 left-1/2 w-24 -translate-x-1/2" angle={i % 2 === 0 ? -5 : 4} tone={i % 3 === 0 ? "manila" : "clear"} />
              </RevealOnScroll>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
