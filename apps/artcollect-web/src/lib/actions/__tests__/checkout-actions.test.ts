import { beforeEach, describe, expect, it, vi } from "vitest";
import { initiateCheckoutAction, type CheckoutInput } from "../checkout-actions";
import { normalizeKenyanPhone } from "@/lib/phone";
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
  payment: {
    create: vi.fn(),
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

const mpesaMock = vi.hoisted(() => ({
  initiateStkPush: vi.fn(),
}));

const navigationMock = vi.hoisted(() => ({
  redirect: vi.fn(),
}));

vi.mock("@artcollect/database", () => ({ prisma: prismaMock }));
vi.mock("@/lib/mpesa", () => mpesaMock);
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
    buyerPhone: "0712 345 678",
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
  prismaMock.payment.create.mockResolvedValue({ id: "payment-1" });
  mpesaMock.initiateStkPush.mockResolvedValue({
    merchantRequestId: "merchant-1",
    checkoutRequestId: "ws_CO_test123",
  });
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
    expect(navigationMock.redirect).toHaveBeenCalledWith("/orders/order-1/pending");
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

describe("normalizeKenyanPhone — the send-to number", () => {
  it("normalizes 07…, 01…, 2547… and +2547… forms to E.164", () => {
    expect(normalizeKenyanPhone("0712 345 678")).toBe("+254712345678");
    expect(normalizeKenyanPhone("0110 123 456")).toBe("+254110123456");
    expect(normalizeKenyanPhone("254712345678")).toBe("+254712345678");
    expect(normalizeKenyanPhone("+254712345678")).toBe("+254712345678");
    expect(normalizeKenyanPhone("(0712) 345-678")).toBe("+254712345678");
  });

  it("rejects non-Kenyan or malformed numbers", () => {
    expect(normalizeKenyanPhone("0812 345 678")).toBeNull();
    expect(normalizeKenyanPhone("0712 345 67")).toBeNull();
    expect(normalizeKenyanPhone("+14155551234")).toBeNull();
    expect(normalizeKenyanPhone("hello")).toBeNull();
  });
});

describe("initiateCheckoutAction — M-Pesa STK Push", () => {
  beforeEach(() => {
    prismaMock.ticketingEvent.findUnique.mockResolvedValue(eventFixture([tierFixture()]));
    liveRemaining(50);
    runTransactionWith(prismaMock);
  });

  it("sends the normalized phone to Daraja and redirects to the order's pending page", async () => {
    const result = await initiateCheckoutAction(input({ buyerPhone: "0712 345 678" }));

    expect(result).toBeUndefined();
    expect(mpesaMock.initiateStkPush).toHaveBeenCalledWith(
      expect.objectContaining({ phone: "+254712345678", amountMinor: 20000 }),
    );
    expect(navigationMock.redirect).toHaveBeenCalledWith("/orders/order-1/pending");
  });

  it("records a pending Payment keyed by the returned CheckoutRequestID", async () => {
    await initiateCheckoutAction(input());

    expect(prismaMock.payment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        orderId: "order-1",
        provider: "mpesa",
        providerRef: "ws_CO_test123",
        status: "pending",
      }),
    });
  });

  it("rejects a malformed phone before creating any order", async () => {
    const result = await initiateCheckoutAction(input({ buyerPhone: "12345" }));

    expect(result?.error).toMatch(/valid Safaricom number/i);
    expect(prismaMock.order.create).not.toHaveBeenCalled();
  });

  it("returns a friendly error if Daraja rejects the push, without throwing", async () => {
    mpesaMock.initiateStkPush.mockRejectedValue(new Error("Daraja is down"));

    const result = await initiateCheckoutAction(input());

    expect(result?.error).toMatch(/couldn.t send the m-pesa prompt/i);
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
