import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTierRemaining } from "../inventory";

/**
 * Verification-table row (docs/11): `getTierRemaining` — the one function
 * availability everywhere is derived from. Prisma is mocked; the DB-backed
 * idempotency guarantee for orders lives in `order-fulfillment.db.test.ts`.
 */

const prismaMock = vi.hoisted(() => ({
  ticketTier: {
    findUniqueOrThrow: vi.fn(),
  },
  ticket: {
    count: vi.fn(),
  },
  inventoryHold: {
    aggregate: vi.fn(),
  },
}));

vi.mock("@artcollect/database", () => ({ prisma: prismaMock }));

function mockTier({ capacity }: { capacity: number }) {
  prismaMock.ticketTier.findUniqueOrThrow.mockResolvedValue({
    id: "tier-1",
    capacity,
  });
}

function mockCounts({ issued, held }: { issued: number; held: number }) {
  prismaMock.ticket.count.mockResolvedValue(issued);
  prismaMock.inventoryHold.aggregate.mockResolvedValue({ _sum: { quantity: held } });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getTierRemaining", () => {
  it("returns 0 at capacity 0, even with no issued tickets or holds", async () => {
    mockTier({ capacity: 0 });
    mockCounts({ issued: 0, held: 0 });

    await expect(getTierRemaining("tier-1")).resolves.toBe(0);
  });

  it("never goes negative — over-issued inventory clamps to 0", async () => {
    mockTier({ capacity: 10 });
    mockCounts({ issued: 12, held: 3 });

    await expect(getTierRemaining("tier-1")).resolves.toBe(0);
  });

  it("subtracts issued tickets and active holds from capacity", async () => {
    mockTier({ capacity: 100 });
    mockCounts({ issued: 30, held: 12 });

    await expect(getTierRemaining("tier-1")).resolves.toBe(58);
  });

  it("counts only active/checked_in/transferred tickets as issued", async () => {
    mockTier({ capacity: 100 });
    mockCounts({ issued: 0, held: 0 });

    await getTierRemaining("tier-1");

    expect(prismaMock.ticket.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tierId: "tier-1",
          status: { in: ["active", "checked_in", "transferred"] },
        }),
      }),
    );
  });

  it("excludes expired holds — only holds with a future expiry are held against capacity", async () => {
    mockTier({ capacity: 100 });
    mockCounts({ issued: 0, held: 0 });

    await getTierRemaining("tier-1");

    // The aggregate's `where` must filter on expiry; an expired hold must
    // never be able to reduce availability.
    expect(prismaMock.inventoryHold.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tierId: "tier-1",
          expiresAt: { gt: expect.any(Date) },
        }),
      }),
    );
    // And the filter's cutoff must be "now or later", not a stale date.
    const call = prismaMock.inventoryHold.aggregate.mock.calls[0]?.[0] as {
      where: { expiresAt: { gt: Date } };
    };
    expect(call.where.expiresAt.gt.getTime()).toBeLessThanOrEqual(Date.now() + 5_000);
  });

  it("treats a missing hold-sum (null aggregate) as zero", async () => {
    mockTier({ capacity: 50 });
    prismaMock.ticket.count.mockResolvedValue(10);
    prismaMock.inventoryHold.aggregate.mockResolvedValue({ _sum: { quantity: null } });

    await expect(getTierRemaining("tier-1")).resolves.toBe(40);
  });
});
