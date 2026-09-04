import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Annotation, StapleMark, TapePiece } from "@artcollect/ui";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { formatKes } from "@/lib/format";
import type { CauseCard } from "@/lib/causes";

/**
 * Homepage causes band (docs/11-style continuation): collage-lane cause
 * scraps with live progress, handing off to TikoYetu for the actual
 * payment. One dominant style (collage), one secondary accent
 * (handwritten note) — per the section discipline.
 */
export function CausesBand({ causes }: { causes: CauseCard[] }) {
  if (causes.length === 0) return null;

  return (
    <section id="causes" className="relative z-10 bg-paper-deep">
      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
              Fund the walls &amp; workshops
            </p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              ART CAUSES
            </h2>
          </div>
          <a
            href="/causes"
            className="group inline-flex items-center gap-2 border-2 border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            All causes
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {causes.slice(0, 2).map((cause, i) => (
            <RevealOnScroll
              key={cause.id}
              index={i}
              as="article"
              className="relative border-2 border-ink bg-paper p-4 shadow-[5px_5px_0_rgba(22,19,17,1)]"
              style={{ rotate: `${i % 2 === 0 ? -0.9 : 0.8}deg` }}
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
              <StapleMark className="absolute right-4 top-4" angle={i % 2 === 0 ? 10 : -8} />

              <div className="p-3">
                <h3 className="font-display text-2xl text-ink">{cause.title}</h3>
                <p className="mt-1 text-sm text-ink/60">
                  {cause.country ?? "East Africa"} · run by {cause.organiserName}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-ink/75">{cause.summary}</p>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-bold text-ink">
                      {formatKes(cause.raisedMinor, cause.currency)}
                    </span>
                    <span className="text-ink/50">
                      of {formatKes(cause.goalMinor, cause.currency)}
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
                </div>

                <Link
                  href={cause.donatePath}
                  className="group mt-5 inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-coral hover:text-ink"
                >
                  <Heart size={15} aria-hidden />
                  Donate on TikoYetu
                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <TapePiece className="-top-3 left-1/2 w-24 -translate-x-1/2" angle={i % 2 === 0 ? -4 : 3} />
            </RevealOnScroll>
          ))}
        </div>

        <div className="mt-8">
          <Annotation tone="marker">
            every shilling is receipted — paint litres &amp; stipend weeks, published
          </Annotation>
        </div>
      </div>
    </section>
  );
}
