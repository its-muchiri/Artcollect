import { beforeEach, describe, expect, it, vi } from "vitest";
import { initiateDonationAction } from "../donation-actions";
import {
  DONATION_BOUNDS_MINOR,
  validateDonationInput,
  type DonationInput,
} from "@/lib/donation-validation";

/**
 * Donation checkout validation (the donation twin of the checkout-actions
 * suite). The form's clamping is a UX convenience; these tests prove the
 * server rejects bad input — amounts outside the bounds, bad emails, and
 * unpublished causes — before any Flutterwave session is created. Bounds
 * are currency-aware (KES vs USD causes), so tests exercise both.
 */

const prismaMock = vi.hoisted(() => ({
  donationCause: {
    findUnique: vi.fn(),
  },
  donation: {
    create: vi.fn(),
  },
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

const KES_BOUNDS = DONATION_BOUNDS_MINOR.KES!;
const USD_BOUNDS = DONATION_BOUNDS_MINOR.USD!;

function input(overrides: Partial<DonationInput> = {}): DonationInput {
  return {
    causeId: "cause-1",
    amountMinor: 100_000, // KES 1,000 — comfortably inside the KES bounds
    donorEmail: "donor@example.com",
    currency: "KES",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.donationCause.findUnique.mockResolvedValue({
    id: "cause-1",
    status: "published",
    currency: "KES",
    title: "Kibera Walls Fund",
  });
  prismaMock.donation.create.mockImplementation(async ({ data }: { data: { amountMinor: number } }) => ({
    id: "donation-1",
    ...data,
  }));
  flutterwaveMock.initiateStandardPayment.mockResolvedValue("https://checkout.flutterwave.com/pay/x");
  process.env.NEXT_PUBLIC_APP_URL = "https://tikoyetu.example";
});

describe("validateDonationInput — bounds", () => {
  it("rejects KES amounts below KES 500", () => {
    expect(validateDonationInput(input({ amountMinor: KES_BOUNDS.min - 1 }))).toMatch(
      /smallest donation/i,
    );
  });

  it("rejects non-integer and zero amounts", () => {
    expect(validateDonationInput(input({ amountMinor: 0 }))).toMatch(/smallest donation/i);
    expect(validateDonationInput(input({ amountMinor: 100.5 }))).toMatch(/smallest donation/i);
  });

  it("rejects KES amounts above KES 100,000", () => {
    expect(validateDonationInput(input({ amountMinor: KES_BOUNDS.max + 1 }))).toMatch(
      /email us directly/i,
    );
  });

  it("accepts KES 500 and KES 100,000 exactly (bounds inclusive)", () => {
    expect(validateDonationInput(input({ amountMinor: KES_BOUNDS.min }))).toBeNull();
    expect(validateDonationInput(input({ amountMinor: KES_BOUNDS.max }))).toBeNull();
  });

  it("applies $5–$10,000 bounds for USD causes instead of the KES ones", () => {
    expect(
      validateDonationInput(input({ currency: "USD", amountMinor: USD_BOUNDS.min - 1 })),
    ).toMatch(/smallest donation/i);
    expect(validateDonationInput(input({ currency: "USD", amountMinor: USD_BOUNDS.min }))).toBeNull();
    expect(
      validateDonationInput(input({ currency: "USD", amountMinor: USD_BOUNDS.max + 1 })),
    ).toMatch(/email us directly/i);
  });

  it("rejects malformed emails", () => {
    expect(validateDonationInput(input({ donorEmail: "not-an-email" }))).toMatch(/valid email/i);
    expect(validateDonationInput(input({ donorEmail: "a@b" }))).toMatch(/valid email/i);
  });

  it("accepts a well-formed donation", () => {
    expect(validateDonationInput(input())).toBeNull();
  });
});

describe("initiateDonationAction", () => {
  it("refuses unpublished or missing causes", async () => {
    prismaMock.donationCause.findUnique.mockResolvedValue(null);

    const result = await initiateDonationAction(input());

    expect(result?.error).toMatch(/not currently accepting/i);
    expect(prismaMock.donation.create).not.toHaveBeenCalled();
  });

  it("creates a pending donation and redirects to the provider checkout", async () => {
    const result = await initiateDonationAction(
      input({ donorName: "Amina", message: "For the wall", anonymous: true }),
    );

    expect(result).toBeUndefined(); // redirect fired
    expect(prismaMock.donation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        causeId: "cause-1",
        amountMinor: 100_000,
        status: "pending",
        anonymous: true,
        donorName: "Amina",
        message: "For the wall",
      }),
    });
    expect(flutterwaveMock.initiateStandardPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        txRef: "don_donation-1", // the donation/order disambiguation prefix
        amountMinor: 100_000,
        currency: "KES",
        redirectUrl: "https://tikoyetu.example/donations/donation-1/pending",
      }),
    );
    expect(navigationMock.redirect).toHaveBeenCalledWith("https://checkout.flutterwave.com/pay/x");
  });

  it("validates against the CAUSE's currency, not the request's, and returns the error without creating a row", async () => {
    // The cause is KES; even if the caller claims USD, the cause lookup's
    // currency is what actually governs the bound (see donation-actions.ts).
    const result = await initiateDonationAction(input({ amountMinor: 5, currency: "USD" }));

    expect(result?.error).toMatch(/smallest donation/i);
    expect(prismaMock.donation.create).not.toHaveBeenCalled();
    expect(flutterwaveMock.initiateStandardPayment).not.toHaveBeenCalled();
  });
});
