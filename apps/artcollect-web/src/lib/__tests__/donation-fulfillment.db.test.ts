import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@artcollect/database";
import type { VerifiedTransaction } from "@/lib/flutterwave";
import { finalizeDonationPayment } from "../donation-fulfillment";

/**
 * Donation idempotency against the real database (the donation twin of
 * `order-fulfillment.db.test.ts`): the webhook and the donor's return
 * page both call `finalizeDonationPayment` — the gift must be marked
 * received exactly once. Skips (honestly) when no database is reachable.
 */

let dbReachable = false;
try {
  await prisma.$queryRaw`SELECT 1`;
  dbReachable = true;
} catch {
  dbReachable = false;
}

async function createFixture(): Promise<{ donationId: string; amountMinor: number; causeSlug: string }> {
  const suffix = randomUUID();
  const cause = await prisma.donationCause.create({
    data: {
      slug: `test-cause-${suffix}`,
      title: "Idempotency Test Cause",
      summary: "Test",
      story: "Test story",
      organiserName: "Test Organiser",
      goalMinor: 1000000n,
      currency: "KES",
      status: "published",
    },
  });
  const donation = await prisma.donation.create({
    data: {
      causeId: cause.id,
      donorEmail: "donor@example.com",
      amountMinor: 25000,
      currency: "KES",
      status: "pending",
    },
  });
  return { donationId: donation.id, amountMinor: 25000, causeSlug: cause.slug };
}

async function cleanup(donationId: string): Promise<void> {
  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) return;
  await prisma.donation.delete({ where: { id: donationId } }).catch(() => undefined);
  await prisma.donationCause
    .delete({ where: { id: donation.causeId } })
    .catch(() => undefined);
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe("finalizeDonationPayment — idempotency (real database)", () => {
  it.skipIf(!dbReachable)(
    "marks the gift succeeded exactly once across two callers",
    async () => {
      const fixture = await createFixture();
      const verified: VerifiedTransaction = {
        txRef: `don_${fixture.donationId}`,
        providerRef: `prov-${randomUUID()}`,
        amountMinor: fixture.amountMinor,
        currency: "KES",
        status: "successful",
        paymentType: "M-Pesa",
      };

      try {
        const first = await finalizeDonationPayment(fixture.donationId, verified);
        expect(first.status).toBe("succeeded");
        expect(first.causeSlug).toBe(fixture.causeSlug);

        // The webhook retry / return page race: same verified transaction.
        const second = await finalizeDonationPayment(fixture.donationId, verified);
        expect(second.status).toBe("already_succeeded");

        const row = await prisma.donation.findUniqueOrThrow({
          where: { id: fixture.donationId },
        });
        expect(row.status).toBe("succeeded");
        expect(row.providerRef).toBe(verified.providerRef);
        expect(row.webhookEventId).toBe(verified.providerRef);
      } finally {
        await cleanup(fixture.donationId);
      }
    },
    30000,
  );

  it.skipIf(!dbReachable)("leaves the donation untouched on an amount mismatch", async () => {
    const fixture = await createFixture();
    const verified: VerifiedTransaction = {
      txRef: `don_${fixture.donationId}`,
      providerRef: `prov-${randomUUID()}`,
      amountMinor: fixture.amountMinor - 1, // one cent short
      currency: "KES",
      status: "successful",
    };

    try {
      const result = await finalizeDonationPayment(fixture.donationId, verified);
      expect(result.status).toBe("amount_mismatch");

      const row = await prisma.donation.findUniqueOrThrow({
        where: { id: fixture.donationId },
      });
      expect(row.status).toBe("pending"); // NOT marked anything
      expect(row.providerRef).toBeNull();
    } finally {
      await cleanup(fixture.donationId);
    }
  }, 30000);
});
