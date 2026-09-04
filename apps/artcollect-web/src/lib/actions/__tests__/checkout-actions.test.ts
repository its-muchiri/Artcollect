import { beforeEach, describe, expect, it, vi } from "vitest";
import { initiateCheckoutAction, type CheckoutInput } from "../checkout-actions";
/**
 * Verification-table row (docs/11): checkout server-action validation.
 * The UI's clamping is a UX convenience — these tests prove the server
 * rejects bad quantities *even when the client would have blocked them*,
 * re-validating against each tier's min/max and LIVE availability inside
 * the transaction.
 */

const prismaMock = vi.hoisted(() => ({
  ticketingEvent: {
    findUnique: vi.fn(),
  },
  order: {
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  ticket: {
    count: vi.fn(),
  },
  inventoryHold: {
    aggregate: vi.fn(),
    createMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

const flutterwaveMock = vi.hoisted(() => ({
  initiateStandardPayment: vi.fn(),
}));

const navigationMock = vi.hoisted(() => ({
  redirect: vi.fn(),
}));

vi.mock("@artcollect/database", () => ({ prisma: prismaMock }));
vi.mock("@/lib/flutterwave", () => flutterwaveMock);
vi.mock("next/navigation", () => navigationMock);

/** Builds a prisma `$transaction` mock that runs the callback against `tx`. */
function runTransactionWith(tx: Record<string, unknown>) {
  prismaMock.$transaction.mockImplementation(
    async (callback: (tx: Record<string, unknown>) => Promise<string>) => callback(tx),
  );
}

function tierFixture(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "tier-1",
    name: "General",
    priceMinor: 10000n,
    currency: "KES",
    capacity: 100,
    minPerOrder: 1,
    maxPerOrder: 10,
    ...overrides,
  };
}

function eventFixture(tiers: unknown[]) {
  return { id: "event-1", status: "on_sale", currency: "KES", title: "Test Event", tiers };
}

/** Mocks the live transaction counts so that capacity(100) − issued − held === `remaining`. */
function liveRemaining(remaining: number) {
  prismaMock.ticket.count.mockResolvedValue(0);
  prismaMock.inventoryHold.aggregate.mockResolvedValue({ _sum: { quantity: 100 - remaining } });
}

function input(overrides: Partial<CheckoutInput> = {}): CheckoutInput {
  return {
    eventId: "event-1",
    buyerEmail: "buyer@example.com",
    selections: [{ tierId: "tier-1", quantity: 2 }],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();

  prismaMock.order.create.mockResolvedValue({ id: "order-1", totalMinor: 20000n, currency: "KES" });
  prismaMock.order.findUniqueOrThrow.mockResolvedValue({
    id: "order-1",
    totalMinor: 20000n,
    currency: "KES",
  });
  prismaMock.inventoryHold.createMany.mockResolvedValue({ count: 1 });
  flutterwaveMock.initiateStandardPayment.mockResolvedValue("https://checkout.flutterwave.com/pay/x");
  process.env.NEXT_PUBLIC_APP_URL = "https://tikoyetu.example";
});

describe("initiateCheckoutAction — event gate", () => {
  it("rejects selections when the event is not on sale", async () => {
    prismaMock.ticketingEvent.findUnique.mockResolvedValue({
      ...eventFixture([tierFixture()]),
      status: "draft",
    });
    liveRemaining(50);

    const result = await initiateCheckoutAction(input());

    expect(result?.error).toMatch(/not currently on sale/i);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects when the event does not exist", async () => {
    prismaMock.ticketingEvent.findUnique.mockResolvedValue(null);

    const result = await initiateCheckoutAction(input());

    expect(result?.error).toMatch(/not currently on sale/i);
  });

  it("rejects an entirely empty selection set", async () => {
    const result = await initiateCheckoutAction(input({ selections: [{ tierId: "tier-1", quantity: 0 }] }));

    expect(result?.error).toMatch(/select at least one ticket/i);
  });
});

describe("initiateCheckoutAction — min/max per order", () => {
  beforeEach(() => {
    prismaMock.ticketingEvent.findUnique.mockResolvedValue(
      eventFixture([tierFixture({ minPerOrder: 2, maxPerOrder: 4 })]),
    );
    liveRemaining(50);
  });

  it("rejects a quantity below minPerOrder", async () => {
    const result = await initiateCheckoutAction(input({ selections: [{ tierId: "tier-1", quantity: 1 }] }));

    expect(result?.error).toMatch(/between 2 and 4/);
  });

  it("rejects a quantity above maxPerOrder", async () => {
    const result = await initiateCheckoutAction(input({ selections: [{ tierId: "tier-1", quantity: 5 }] }));

    expect(result?.error).toMatch(/between 2 and 4/);
  });

  it("accepts a quantity inside min/max even when the UI sent unclamped values", async () => {
    runTransactionWith(prismaMock);

    const result = await initiateCheckoutAction(input({ selections: [{ tierId: "tier-1", quantity: 3 }] }));

    expect(result).toBeUndefined(); // redirect fired
    expect(navigationMock.redirect).toHaveBeenCalledWith("https://checkout.flutterwave.com/pay/x");
  });
});

describe("initiateCheckoutAction — live remaining (stale client state)", () => {
  beforeEach(() => {
    // maxPerOrder high enough that the quantities below fail the LIVE
    // remaining check, not the static min/max one.
    prismaMock.ticketingEvent.findUnique.mockResolvedValue(
      eventFixture([tierFixture({ maxPerOrder: 40 })]),
    );
  });

  it("rejects a quantity above LIVE remaining even though it is inside min/max", async () => {
    // The client loaded the page when 40 were left and picked 30; meanwhile
    // sales drained live remaining to 5. The server must refuse.
    liveRemaining(5);
    runTransactionWith(prismaMock);

    const result = await initiateCheckoutAction(input({ selections: [{ tierId: "tier-1", quantity: 30 }] }));

    expect(result?.error).toMatch(/only 5 left/i);
    expect(prismaMock.order.create).not.toHaveBeenCalled();
  });

  it("rejects when remaining is exactly zero", async () => {
    liveRemaining(0);
    runTransactionWith(prismaMock);

    const result = await initiateCheckoutAction(input({ selections: [{ tierId: "tier-1", quantity: 1 }] }));

    expect(result?.error).toMatch(/only 0 left/i);
  });

  it("accepts a quantity equal to live remaining and creates the order + holds atomically", async () => {
    liveRemaining(30);
    runTransactionWith(prismaMock);

    const result = await initiateCheckoutAction(input({ selections: [{ tierId: "tier-1", quantity: 30 }] }));

    expect(result).toBeUndefined();
    expect(prismaMock.order.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.inventoryHold.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ tierId: "tier-1", quantity: 30, orderId: "order-1" })],
    });
  });
});

describe("initiateCheckoutAction — unknown tier", () => {
  it("rejects a tierId that does not belong to the event", async () => {
    prismaMock.ticketingEvent.findUnique.mockResolvedValue(eventFixture([tierFixture()]));
    liveRemaining(50);

    const result = await initiateCheckoutAction(
      input({ selections: [{ tierId: "tier-gone", quantity: 1 }] }),
    );

    expect(result?.error).toMatch(/no longer exists/i);
  });
});
