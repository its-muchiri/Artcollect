import "server-only";
import { prisma } from "@artcollect/database";
import { computeCauseProgress } from "@artcollect/contracts";

/**
 * Donation-cause reads (docs/11-style continuation: donations run on the
 * TikoYetu payment rail, mirroring the order machinery). Progress is
 * always computed from real rows — the sum of `succeeded` donations —
 * never trusted from a stored counter. The pure math lives in
 * `@artcollect/contracts` so ArtCollect's editorial causes page mirrors
 * it exactly.
 */

export interface DonationCauseCard {
  id: string;
  slug: string;
  title: string;
  summary: string;
  country: string | null;
  organiserName: string;
  currency: string;
  coverImage: string | null;
  goalMinor: number;
  raisedMinor: number;
  /** 0–100, capped. Computed, never stored. */
  progressPercent: number;
  donorCount: number;
}

export interface DonationSupporter {
  displayName: string;
  amountMinor: number;
  message: string | null;
  createdAt: string;
}

export interface DonationCauseDetail extends DonationCauseCard {
  story: string;
  supporters: DonationSupporter[];
}

/**
 * Pure progress math moved to `@artcollect/contracts` (shared with
 * ArtCollect's editorial causes page). Kept as a re-export so existing
 * call sites don't change.
 */
export { computeCauseProgress as computeProgress };

/** Public display name: anonymous stays anonymous, everything else shows the given name or the email's local part. */
export function supporterDisplayName(donation: {
  anonymous: boolean;
  donorName: string | null;
  donorEmail: string;
}): string {
  if (donation.anonymous) return "Anonymous";
  if (donation.donorName && donation.donorName.trim().length > 0) return donation.donorName.trim();
  return donation.donorEmail.split("@")[0] ?? "Supporter";
}

function toCard(
  cause: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    country: string | null;
    organiserName: string;
    currency: string;
    coverImageKey: string | null;
    goalMinor: bigint;
    _count: { donations: number };
  },
  raisedMinor: number,
): DonationCauseCard {
  return {
    id: cause.id,
    slug: cause.slug,
    title: cause.title,
    summary: cause.summary,
    country: cause.country,
    organiserName: cause.organiserName,
    currency: cause.currency,
    coverImage: cause.coverImageKey,
    goalMinor: Number(cause.goalMinor),
    raisedMinor,
    progressPercent: computeCauseProgress(raisedMinor, Number(cause.goalMinor)),
    donorCount: cause._count.donations,
  };
}

export async function listPublishedCauses(): Promise<DonationCauseCard[]> {
  const causes = await prisma.donationCause.findMany({
    where: { status: "published" },
    include: {
      _count: { select: { donations: { where: { status: "succeeded" } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  const raisedByCause = await prisma.donation.groupBy({
    by: ["causeId"],
    where: { status: "succeeded" },
    _sum: { amountMinor: true },
  });
  const raisedMap = new Map(
    raisedByCause.map((row) => [row.causeId, Number(row._sum.amountMinor ?? 0)]),
  );

  return causes.map((cause) => toCard(cause, raisedMap.get(cause.id) ?? 0));
}

export async function getCauseBySlug(slug: string): Promise<DonationCauseDetail | null> {
  const cause = await prisma.donationCause.findUnique({
    where: { slug },
    include: {
      _count: { select: { donations: { where: { status: "succeeded" } } } },
    },
  });
  if (!cause || cause.status !== "published") return null;

  const [raisedAgg, supporters] = await Promise.all([
    prisma.donation.aggregate({
      where: { causeId: cause.id, status: "succeeded" },
      _sum: { amountMinor: true },
    }),
    prisma.donation.findMany({
      where: { causeId: cause.id, status: "succeeded" },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
  ]);

  const raisedMinor = Number(raisedAgg._sum.amountMinor ?? 0);

  return {
    ...toCard(cause, raisedMinor),
    story: cause.story,
    supporters: supporters.map((donation) => ({
      displayName: supporterDisplayName(donation),
      amountMinor: Number(donation.amountMinor),
      message: donation.message,
      createdAt: donation.createdAt.toISOString(),
    })),
  };
}
