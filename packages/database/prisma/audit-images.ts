import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");
const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

async function main() {
  const webRoot = join(process.cwd(), "..", "..", "apps", "artcollect-web");
  const missing: string[] = [];
  const external = new Set<string>();

  function checkLocal(path: string, label: string): void {
    if (!path) return;
    if (path.startsWith("/")) {
      if (!existsSync(join(webRoot, "public", path))) missing.push(`${label}: ${path}`);
    } else {
      external.add(path);
    }
  }

  // 1. Local image paths referenced in app source
  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const s = statSync(full);
      if (s.isDirectory()) out.push(...walk(full));
      else if (/\.(tsx|ts|css)$/.test(entry)) out.push(full);
    }
    return out;
  }
  const pathRe = /\/(?:artists|events|partners|brand|images)\/[A-Za-z0-9._\-/]+\.(?:jpeg|jpg|png|svg|webp|ico)/g;
  for (const file of walk(join(webRoot, "src"))) {
    const text = readFileSync(file, "utf8");
    for (const m of text.matchAll(pathRe)) {
      const p = m[0].replace(/[.,)]+$/, "");
      if (!existsSync(join(webRoot, "public", p))) missing.push(`src: ${p}`);
    }
    for (const m of text.matchAll(/https:\/\/images\.unsplash\.com[A-Za-z0-9._/?=&%-]*/g)) external.add(m[0]);
  }

  // 2. Database-referenced images
  const media = await prisma.artworkMedia.findMany({ select: { storageKey: true, altText: true } });
  for (const m of media) checkLocal(m.storageKey, "db.media");
  const events = await prisma.event.findMany({ select: { title: true, coverImageKey: true } });
  for (const e of events) checkLocal(e.coverImageKey, "db.event");
  const causes = await prisma.donationCause.findMany({ select: { title: true, coverImageKey: true } }).catch(() => []);
  for (const c of causes) checkLocal(c.coverImageKey, "db.cause");
  const posts = await prisma.post.findMany({ select: { title: true, coverImageKey: true } }).catch(() => []);
  for (const p of posts) checkLocal(p.coverImageKey, "db.post");
  const artworksNoMedia = await prisma.artwork.count({
    where: { status: "published", deletedAt: null, media: { none: {} } },
  });
  if (artworksNoMedia > 0) missing.push(`db: ${artworksNoMedia} published artwork(s) with NO media row`);

  console.log(`DB media rows: ${media.length} - events: ${events.length} - causes: ${causes.length} - posts: ${posts.length}`);
  console.log(`External image URLs (checked over HTTP separately): ${external.size}`);
  if (missing.length === 0) {
    console.log("ALL LOCAL IMAGE REFERENCES RESOLVE OK");
  } else {
    console.log(`MISSING (${missing.length}):`);
    for (const m of missing) console.log("  " + m);
  }
  await prisma.$disconnect();
}

main();
