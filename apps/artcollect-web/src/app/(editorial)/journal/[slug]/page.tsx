import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Annotation, StapleMark, TapePiece } from "@artcollect/ui";
import { Coverflow, type CoverflowItem } from "@/components/carousel/Coverflow";
import { getPostBySlug, listPublishedPosts } from "@/lib/posts";
import { parsePostBody } from "@/lib/post-format";

// Publishing happens from the studio; render per-request.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Story not found — ArtCollect" };
  return {
    title: `${post.title} — ArtCollect Journal`,
    description: post.excerpt ?? undefined,
  };
}

/**
 * A journal story: the reading page stays deliberately calm — paper,
 * Inter body at one readable measure, Anton headings — with the
 * handwritten lane appearing exactly once as the pull-quote accent.
 */
export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const blocks = parsePostBody(post.body);
  const more = (await listPublishedPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-paper">
      <article className="mx-auto w-full max-w-3xl px-[var(--ac-gutter)] pb-20 pt-24">
        <Link href="/journal" className="text-sm font-semibold text-cobalt hover:text-ink">
          ← The Journal
        </Link>

        <h1 className="mt-6 font-display text-4xl leading-tight text-ink sm:text-6xl">
          {post.title}
        </h1>

        <p className="mt-4 text-sm text-ink/50">
          By {post.authorName} ·{" "}
          {post.publishedAt
            ? new Intl.DateTimeFormat("en-KE", { day: "numeric", month: "long", year: "numeric" }).format(
                new Date(post.publishedAt),
              )
            : "Unpublished"}{" "}
          · {post.readingMinutes} min read
        </p>

        {post.coverImage && (
          <figure className="relative mt-8 border-2 border-ink bg-paper-deep shadow-[6px_6px_0_rgba(var(--ac-shadow-rgb),0.9)]" style={{ rotate: "-0.6deg" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery */}
            <img
              src={post.coverImage}
              alt={post.title}
              className="block aspect-[16/9] w-full object-cover"
            />
            <TapePiece className="-top-3 left-8 w-24" angle={-4} />
            <StapleMark className="absolute bottom-3 right-3" angle={10} />
          </figure>
        )}

        {post.excerpt && (
          <p className="mt-10 text-xl leading-relaxed text-ink/80">{post.excerpt}</p>
        )}

        <div className="mt-8 space-y-6">
          {blocks.map((block, i) => {
            if (block.kind === "heading") {
              return (
                <h2
                  key={i}
                  className="pt-4 font-display text-2xl text-ink sm:text-3xl"
                >
                  {block.text}
                </h2>
              );
            }
            if (block.kind === "quote") {
              return (
                <blockquote key={i} className="my-8">
                  <Annotation tone="highlight" rotate={-0.8} className="text-xl leading-relaxed sm:text-2xl">
                    “{block.text}”
                  </Annotation>
                </blockquote>
              );
            }
            return (
              <p key={i} className="leading-relaxed text-ink/80">
                {block.text}
              </p>
            );
          })}
        </div>

        {post.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t-2 border-ink pt-6">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-ink/30 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-ink/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {more.length > 0 && (
        <section className="border-t-2 border-ink bg-paper-deep">
          <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-14">
            <h2 className="font-display text-2xl text-ink">MORE FROM THE JOURNAL</h2>
            <div className="mt-4">
              <Coverflow
                label="More journal stories"
                items={more.map((other): CoverflowItem => ({
                  key: other.id,
                  title: other.title,
                  meta: `${other.authorName} · ${other.readingMinutes} min read`,
                  image: other.coverImage,
                  imageAlt: other.title,
                  href: `/journal/${other.slug}`,
                }))}
              />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
