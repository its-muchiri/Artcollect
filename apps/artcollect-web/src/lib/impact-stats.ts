import "server-only";
import { prisma } from "@artcollect/database";

/**
 * Homepage impact stats (docs/11-style continuation): the three numbers
 * that answer "what is ArtCollect actually doing?" — how many causes are
 * open, how many events have already happened, and how many people have
 * put money into community charity work. Every figure is a live count from
 * real rows, never a hard-coded placeholder.
 */
export interface ImpactStats {
  /** Open, published donation causes currently fundraising. */
  causes: number;
  /** Events that have already ended (previous / past events). */
  previousEvents: number;
  /** Total donors across all causes — the community charity-work number. */
  supporters: number;
}

export async function getImpactStats(): Promise<ImpactStats> {
  const [causes, previousEvents, supporters] = await Promise.all([
    prisma.donationCause.count({ where: { status: "published" } }),
    prisma.ticketingEvent.count({ where: { status: "ended" } }),
    prisma.donation.count({ where: { status: "succeeded" } }),
  ]);

  return { causes, previousEvents, supporters };
}
