import "server-only";
import { prisma } from "@artcollect/database";
import type { VerifiedTransaction } from "@/lib/flutterwave";

/**
 * Idempotent donation finalization — the donation twin of
 * `order-fulfillment.ts` (docs/07 rules apply identically):
 *
 *   - The donation row is created `pending` when checkout starts and only
 *     ever transitions on a verified server-to-server transaction check —
 *     never a client redirect.
 *   - Both the Flutterwave webhook and the donor's return page call this.
 *     The final transition is a conditional
 *     `updateMany({ where: { id, status: "pending" } })`, so exactly one
 *     caller can win the race no matter the ordering; `providerRef` /
 *     `webhookEventId` uniqueness backs idempotency under provider
 *     retries at the row level.
 *   - Amount/currency must match exactly, or the donation is left
 *     untouched and flagged for manual follow-up.
 */

export type DonationFulfillmentStatus =
  | "succeeded"
  | "already_succeeded"
  | "failed"
  | "amount_mismatch"
  | "not_found";

export interface DonationFulfillmentResult {
  status: DonationFulfillmentStatus;
  causeSlug: string | null;
}

export async function finalizeDonationPayment(
  donationId: string,
  verified: VerifiedTransaction,
): Promise<DonationFulfillmentResult> {
  const donation = await prisma.donation.findUnique({
    where: { id: donationId },
    include: { cause: { select: { slug: true } } },
  });
  if (!donation) return { status: "not_found", causeSlug: null };

  if (donation.status === "succeeded") {
    return { status: "already_succeeded", causeSlug: donation.cause.slug };
  }
  if (donation.status !== "pending") {
    return { status: "failed", causeSlug: donation.cause.slug };
  }
  if (verified.status !== "successful") {
    await prisma.donation.update({
      where: { id: donation.id },
      data: { status: "failed" },
    });
    return { status: "failed", causeSlug: donation.cause.slug };
  }
  if (verified.amountMinor !== Number(donation.amountMinor) || verified.currency !== donation.currency) {
    // Never mark anything on a mismatch — leave the row pending for review.
    return { status: "amount_mismatch", causeSlug: donation.cause.slug };
  }

  // Conditional transition: the caller whose update matches a still-pending
  // row wins; everyone else is a no-op (count 0) — that IS the idempotency.
  const settled = await prisma.donation.updateMany({
    where: { id: donation.id, status: "pending" },
    data: {
      status: "succeeded",
      providerRef: verified.providerRef,
      webhookEventId: verified.providerRef,
    },
  });

  return {
    status: settled.count === 1 ? "succeeded" : "already_succeeded",
    causeSlug: donation.cause.slug,
  };
}
