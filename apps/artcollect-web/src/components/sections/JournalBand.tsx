import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Annotation } from "@artcollect/ui";
import type { PostCard } from "@/lib/posts";

/**
 * Homepage journal band (docs/11-style continuation): vector-lane
 * editorial cards linking into `/journal`. Calm on purpose — the hero
 * owns this page's scroll budget.
 */
export function JournalBand({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) return null;

  return (
    <section id="journal" className="relative z-10 border-y-2 border-ink bg-paper">
      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cobalt">
              Studio visits &amp; scene notes
            </p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              FROM THE JOURNAL
            </h2>
          </div>
          <Link
            href="/journal"
            className="group inline-flex items-center gap-2 border-2 border-ink px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Read the journal
            <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <Link
              key={post.id}
              href={`/journal/${post.slug}`}
              className="group flex flex-col border-2 border-ink bg-paper shadow-[0_0_0_rgba(22,19,17,1)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_rgba(22,19,17,1)]"
            >
              <div className="aspect-[16/10] overflow-hidden border-b-2 border-ink bg-paper-deep">
                {post.coverImage && (
                  // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-lg font-semibold leading-snug text-ink">{post.title}</h3>
                {post.excerpt && (
                  <p className="line-clamp-2 text-sm text-ink/60">{post.excerpt}</p>
                )}
                <p className="mt-auto pt-2 text-xs text-ink/50">
                  {post.authorName} · {post.readingMinutes} min read
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8">
          <Annotation tone="highlight" rotate={-1}>
            every opening in these stories has real tickets →
          </Annotation>
        </div>
      </div>
    </section>
  );
}
