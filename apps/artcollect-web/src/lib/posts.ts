import "server-only";
import { prisma, type PostStatus } from "@artcollect/database";

/**
 * Journal reads (docs/11-style continuation): published posts only,
 * newest first. Editorial content belongs to ArtCollect — the journal is
 * never rendered cross-platform.
 */

export interface PostCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  authorName: string;
  tags: string[];
  publishedAt: string | null;
  readingMinutes: number;
}

export interface PostDetail extends PostCard {
  body: string;
}

function toCard(post: {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImageKey: string | null;
  authorName: string;
  tags: string[];
  publishedAt: Date | null;
  body: string;
}): PostCard {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImageKey,
    authorName: post.authorName,
    tags: post.tags,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    readingMinutes: readingTimeEstimate(post.body),
  };
}

function readingTimeEstimate(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function listPublishedPosts(limit?: number): Promise<PostCard[]> {
  const posts = await prisma.post.findMany({
    where: { status: "published" satisfies PostStatus },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    ...(limit ? { take: limit } : {}),
  });
  return posts.map(toCard);
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || post.status !== "published") return null;
  return { ...toCard(post), body: post.body };
}
