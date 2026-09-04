"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Annotation } from "@artcollect/ui";
import { Coverflow, type CoverflowItem } from "@/components/carousel/Coverflow";
import type { PostCard } from "@/lib/posts";

/**
 * Homepage journal band: the journal's own carousel (a CSS-3D coverflow,
 * deliberately not WebGL — the hero and the Main Wall already carry this
 * page's GPU budget), linking into `/journal`.
 */
export function JournalBand({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) return null;

  const items: CoverflowItem[] = posts.map((post) => ({
    key: post.id,
    title: post.title,
    meta: `${post.authorName} · ${post.readingMinutes} min read`,
    image: post.coverImage,
    imageAlt: post.title,
    href: `/journal/${post.slug}`,
  }));

  return (
    <section id="journal" className="relative z-10 border-y-2 border-ink bg-paper">
      <div className="mx-auto w-full max-w-6xl px-[var(--ac-gutter)] py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
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

        <Coverflow items={items} label="Journal stories" />

        <div className="mt-2">
          <Annotation tone="highlight" rotate={-1}>
            every opening in these stories has real tickets →
          </Annotation>
        </div>
      </div>
    </section>
  );
}

