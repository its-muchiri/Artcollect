import { ArrowRight, Heart } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Annotation } from "@artcollect/ui";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
import { PartnersMarquee } from "@/components/sections/PartnersMarquee";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { Coverflow, type CoverflowItem } from "@/components/carousel/Coverflow";
import { listPublishedPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "The Journal — ArtCollect",
  description: "Studio visits, scene writing, and stories from the East African art wall.",
};

// Publishing happens from the studio; render per-request.
export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "Unpublished";
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/**
 * Journal index (vector-lane editorial, docs/11 style map): one featured
 * story up top, the rest in a flat grid, one handwritten accent. Reading
 * copy stays Inter; headlines Anton.
 */
export default async function JournalPage() {
  const posts = await listPublishedPosts();
  const [featured, ...rest] = posts;

  return (
    <main className="min-h-screen bg-paper">
      <FloatingNavbar />
      <header className="border-b-2 border-ink">
        <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] pb-10 pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
            Studio visits, scene notes, cause stories
          </p>
          <h1 className="mt-3 font-display text-5xl text-ink sm:text-7xl">THE JOURNAL</h1>
          <div className="mt-5">
            <Annotation tone="marker" withTape>
              written by the people holding the scissors
            </Annotation>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-14">
        {posts.length === 0 ? (
          <div className="border-2 border-dashed border-ink/30 p-16 text-center">
            <p className="font-display text-2xl text-ink">Nothing published yet</p>
            <p className="mt-2 text-sm text-ink/60">
              First stories land here soon.
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <RevealOnScroll>
                <Link
                  href={`/journal/${featured.slug}`}
                  className="group grid grid-cols-1 gap-6 border-2 border-ink bg-paper p-4 shadow-[0_0_0_var(--ac-shadow-ink)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ac-shadow-ink)] sm:grid-cols-[3fr_2fr] sm:p-5"
                >
                  <div className="aspect-[16/9] overflow-hidden bg-paper-deep">
                    {featured.coverImage && (
                      // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col justify-center gap-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cobalt">
                      Featured story
                    </p>
                    <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-base text-ink/70">{featured.excerpt}</p>
                    )}
                    <p className="text-sm text-ink/50">
                      {featured.authorName} · {formatDate(featured.publishedAt)} ·{" "}
                      {featured.readingMinutes} min read
                    </p>
                  </div>
                </Link>
              </RevealOnScroll>
            )}

            <div className="mt-10">
              <Coverflow
                label="Journal stories"
                items={rest.map((post): CoverflowItem => ({
                  key: post.id,
                  title: post.title,
                  meta: `${post.authorName} · ${post.readingMinutes} min read`,
                  image: post.coverImage,
                  imageAlt: post.title,
                  href: `/journal/${post.slug}`,
                }))}
              />
            </div>
          </>
        )}
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
            <a
              href="/donate"
              className="inline-flex shrink-0 items-center gap-2 bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:scale-105 active:scale-95"
            >
              <Heart size={16} aria-hidden />
              Donate now
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
        </section>      <PartnersMarquee compact />
    </main>
  );
}
