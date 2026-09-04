/**
 * Daily journal publisher — flips scheduled drafts to published.
 *
 *   npm run journal:publish              # publishes today's batch (default 100/day)
 *   npm run journal:publish -- 5         # publishes 5 today (gentler pace)
 *
 * A draft is eligible when its scheduled `publishedAt` has arrived
 * (scheduled dates were laid out at DAILY_RATE per day by the journal
 * seed). Run it once a day — Windows Task Scheduler or manual — and the
 * journal always has today's fresh content without dumping hundreds of
 * pages at once.
 *
 * ⚠️ Honest note: Google's scaled-content policy deindexes sites that
 * publish large volumes of templated posts. 100/day of first-draft
 * skeletons is squarely in that territory — this script makes the pace
 * possible, but 5–10/day of reviewed posts is the survivable setting.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/client/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");
const prisma = new PrismaClient({ adapter: new PrismaPg(connectionString) });

async function main(): Promise<void> {
  const requested = Number(process.argv[2] ?? process.env.JOURNAL_DAILY ?? 100);
  const count = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : 100;
  const now = new Date();

  // Only drafts whose scheduled date has actually arrived, oldest first.
  const due = await prisma.post.findMany({
    where: { status: "draft", publishedAt: { lte: now } },
    orderBy: { publishedAt: "asc" },
    take: count,
    select: { id: true, slug: true, publishedAt: true },
  });

  if (due.length === 0) {
    const nextUp = await prisma.post.findFirst({
      where: { status: "draft" },
      orderBy: { publishedAt: "asc" },
      select: { publishedAt: true },
    });
    const remaining = await prisma.post.count({ where: { status: "draft" } });
    console.log(
      `Nothing due today. ${remaining} drafts remain scheduled${
        nextUp?.publishedAt ? `; next batch lands ${nextUp.publishedAt.toISOString().slice(0, 10)}` : ""
      }.`,
    );
    return;
  }

  const result = await prisma.post.updateMany({
    where: { id: { in: due.map((d) => d.id) } },
    data: { status: "published" },
  });

  const remaining = await prisma.post.count({ where: { status: "draft" } });
  console.log(
    `Published ${result.count} of ${count} requested (${due
      .slice(0, 3)
      .map((d) => d.slug)
      .join(", ")}${due.length > 3 ? ", …" : ""}). ${remaining} drafts still scheduled.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
