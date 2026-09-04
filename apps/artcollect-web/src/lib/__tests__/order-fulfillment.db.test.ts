import { afterAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { prisma } from "@artcollect/database";
import type { VerifiedTransaction } from "@/lib/flutterwave";
import { finalizeOrderPayment } from "../order-fulfillment";

/**
 * Verification-table row (docs/11): payment idempotency.
 *
 * `finalizeOrderPayment` is reachable from two independent callers — the
 * Flutterwave webhook and the buyer's return-from-checkout page. Calling
 * it twice with the same verified transaction must issue tickets exactly
 * once. That guarantee lives in `Payment.providerRef` uniqueness + an
 * in-transaction status re-read, which mocks cannot prove: this suite runs
 * against the real test database (packages/database/.env) and skips with a
 * clear message when no database is reachable, rather than pretending.
 */

// `it.skipIf` is evaluated at collection time, so connectivity is checked
// with top-level await rather than inside beforeAll.
let dbReachable = false;
try {
  await prisma.$queryRaw`SELECT 1`;
  dbReachable = true;
} catch {
  dbReachable = false;
}

async function createFixture(): Promise<{ orderId: string; totalMinor: bigint; currency: string }> {
  const suffix = randomUUID();
  const organisation = await prisma.organisation.create({
    data: { name: `Test Org ${suffix}`, slug: `test-org-${suffix}`, type: "organiser" },
  });
  const event = await prisma.ticketingEvent.create({
    data: {
      slug: `test-event-${suffix}`,
      title: "Idempotency Test Event",
      venue: "Test Venue",
      timezone: "Africa/Nairobi",
      currency: "KES",
      status: "on_sale",
      organisationId: organisation.id,
    },
  });
  const tier = await prisma.ticketTier.create({
    data: {
      eventId: event.id,
      name: "General",
      priceMinor: 100000n,
      currency: "KES",
      capacity: 10,
    },
  });
  const order = await prisma.order.create({
    data: {
      eventId: event.id,
      buyerEmail: "buyer@example.com",
      status: "pending_payment",
      totalMinor: 300000n,
      currency: "KES",
      items: {
        create: [{ tierId: tier.id, tierNameSnapshot: "General", priceMinorSnapshot: 100000n, quantity: 3 }],
      },
    },
  });
  return { orderId: order.id, totalMinor: order.totalMinor, currency: order.currency };
}

async function cleanup(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { event: true } });
  if (!order) return;
  await prisma.order.delete({ where: { id: orderId } }).catch(() => undefined);
  await prisma.ticketingEvent
    .delete({ where: { id: order.eventId } })
    .catch(() => undefined);
  await prisma.organisation.delete({ where: { id: order.event.organisationId } }).catch(() => undefined);
}

afterAll(async () => {
  await prisma.$disconnect();
});

describe("finalizeOrderPayment — idempotency (real database)", () => {
  it.skipIf(!dbReachable)(
    "issues tickets exactly once when called twice with the same verified transaction",
    async () => {
      const fixture = await createFixture();

      const verified: VerifiedTransaction = {
        txRef: fixture.orderId,
        providerRef: `prov-${randomUUID()}`,
        amountMinor: Number(fixture.totalMinor),
        currency: fixture.currency,
        status: "successful",
        paymentType: "M-Pesa",
      };

      try {
        // Call 1 — the webhook wins the race: order → paid, 3 tickets, tokens returned.
        const first = await finalizeOrderPayment(fixture.orderId, verified);
        expect(first.status).toBe("paid");
        expect(first.tickets).toHaveLength(3);
        expect(first.tickets.every((t) => t.token !== null)).toBe(true);

        // Call 2 — the buyer's return page re-verifies and calls again.
        const second = await finalizeOrderPayment(fixture.orderId, verified);
        expect(["already_paid", "paid"]).toContain(second.status);
        // No matter the reported shape, no NEW tickets may appear...
        expect(second.tickets).toHaveLength(3);
        expect(second.tickets.every((t) => t.token === null)).toBe(true);

        // ...and the database must contain exactly one payment row and
        // exactly three ticket rows for this order.
        const payments = await prisma.payment.count({ where: { orderId: fixture.orderId } });
        expect(payments).toBe(1);

        const tickets = await prisma.ticket.count({ where: { orderId: fixture.orderId } });
        expect(tickets).toBe(3);

        const finalOrder = await prisma.order.findUniqueOrThrow({ where: { id: fixture.orderId } });
        expect(finalOrder.status).toBe("paid");
      } finally {
        await cleanup(fixture.orderId);
      }
    },
    30000,
  );

  it.skipIf(!dbReachable)("rejects an amount mismatch without issuing anything", async () => {
    const fixture = await createFixture();
    const verified: VerifiedTransaction = {
      txRef: fixture.orderId,
      providerRef: `prov-${randomUUID()}`,
      amountMinor: Number(fixture.totalMinor) - 1, // one cent short
      currency: fixture.currency,
      status: "successful",
    };

    try {
      const result = await finalizeOrderPayment(fixture.orderId, verified);
      expect(result.status).toBe("amount_mismatch");
      expect(result.tickets).toHaveLength(0);

      const tickets = await prisma.ticket.count({ where: { orderId: fixture.orderId } });
      expect(tickets).toBe(0);
      const payments = await prisma.payment.count({ where: { orderId: fixture.orderId } });
      expect(payments).toBe(0);
    } finally {
      await cleanup(fixture.orderId);
    }
  }, 30000);
});
