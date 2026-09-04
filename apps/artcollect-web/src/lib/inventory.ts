import "server-only";
import { prisma } from "@artcollect/database";

/**
 * Availability is always computed at read time from real rows — capacity
 * minus issued tickets minus active (non-expired) holds — never trusted
 * from client state or a stored counter, per
 * docs/06_tikoyetu_ticketing_engine.md.
 */
export async function getTierRemaining(tierId: string): Promise<number> {
  const tier = await prisma.ticketTier.findUniqueOrThrow({ where: { id: tierId } });

  const [issuedCount, heldAgg] = await Promise.all([
    prisma.ticket.count({
      where: { tierId, status: { in: ["active", "checked_in", "transferred"] } },
    }),
    prisma.inventoryHold.aggregate({
      where: { tierId, expiresAt: { gt: new Date() } },
      _sum: { quantity: true },
    }),
  ]);

  const held = heldAgg._sum.quantity ?? 0;
  return Math.max(0, tier.capacity - issuedCount - held);
}
