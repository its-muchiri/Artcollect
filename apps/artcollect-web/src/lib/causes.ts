import "server-only";
import { prisma } from "@artcollect/database";
import { computeCauseProgress } from "@artcollect/contracts";

/**
 * Donation-cause discovery for ArtCollect (docs/11-style continuation):
 * the content rows are shared through `@artcollect/database`; the
 * donate/checkout flow lives in the `(tickets)` route group's `/donate`
 * pages. This module maps causes into ArtCollect editorial cards and
 * hands off to that internal route — ArtCollect still never computes
 * payment state itself (docs/08's ownership split survived the merge even
 * though the cross-domain URL construction it originally implied didn't;
 * see the conjoin plan).
 */

export interface CauseCard {
  id: string;
  slug: string;
  title: string;
  summary: string;
  country: string | null;
  organiserName: string;
  coverImage: string | null;
  currency: string;
  goalMinor: number;
  raisedMinor: number;
  progressPercent: number;
  donorCount: number;
  /** Internal path into the (tickets) route group's donate flow. */
  donatePath: string;
}

export async function listPublishedCauseCards(): Promise<CauseCard[]> {
  const [causes, raisedByCause] = await Promise.all([
    prisma.donationCause.findMany({
      where: { status: "published" },
      include: {
        _count: { select: { donations: { where: { status: "succeeded" } } } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.donation.groupBy({
      by: ["causeId"],
      where: { status: "succeeded" },
      _sum: { amountMinor: true },
    }),
  ]);

  const raisedMap = new Map(
    raisedByCause.map((row) => [row.causeId, Number(row._sum.amountMinor ?? 0)]),
  );

  return causes.map((cause) => {
    const raisedMinor = raisedMap.get(cause.id) ?? 0;
    const goalMinor = Number(cause.goalMinor);
    return {
      id: cause.id,
      slug: cause.slug,
      title: cause.title,
      summary: cause.summary,
      country: cause.country,
      organiserName: cause.organiserName,
      coverImage: cause.coverImageKey,
      currency: cause.currency,
      goalMinor,
      raisedMinor,
      progressPercent: computeCauseProgress(raisedMinor, goalMinor),
      donorCount: cause._count.donations,
      donatePath: `/donate/${cause.slug}`,
    };
  });
}
