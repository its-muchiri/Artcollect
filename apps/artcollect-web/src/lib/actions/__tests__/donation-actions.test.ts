import { beforeEach, describe, expect, it, vi } from "vitest";
import { initiateDonationAction } from "../donation-actions";
import {
  MAX_DONATION_MINOR,
  MIN_DONATION_MINOR,
  validateDonationInput,
  type DonationInput,
} from "@/lib/donation-validation";

/**
 * Donation checkout validation (the donation twin of the checkout-actions
 * suite). The form's clamping is a UX convenience; these tests prove the
 * server rejects bad input — amounts outside the bounds, bad emails, and
 * unpublished causes — before any Flutterwave session is created.
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

function input(overrides: Partial<DonationInput> = {}): DonationInput {
  return {
    causeId: "cause-1",
    amountMinor: 25_000,
    donorEmail: "donor@example.com",
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
  it("rejects amounts below the minimum", () => {
    expect(validateDonationInput(input({ amountMinor: MIN_DONATION_MINOR - 1 }))).toMatch(
      /smallest donation/i,
    );
  });

  it("rejects non-integer and zero amounts", () => {
    expect(validateDonationInput(input({ amountMinor: 0 }))).toMatch(/smallest donation/i);
    expect(validateDonationInput(input({ amountMinor: 100.5 }))).toMatch(/smallest donation/i);
  });

  it("rejects amounts above the maximum", () => {
    expect(validateDonationInput(input({ amountMinor: MAX_DONATION_MINOR + 1 }))).toMatch(
      /email us directly/i,
    );
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
        amountMinor: 25_000,
        status: "pending",
        anonymous: true,
        donorName: "Amina",
        message: "For the wall",
      }),
    });
    expect(flutterwaveMock.initiateStandardPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        txRef: "don_donation-1", // the donation/order disambiguation prefix
        amountMinor: 25_000,
        currency: "KES",
        redirectUrl: "https://tikoyetu.example/donations/donation-1/pending",
      }),
    );
    expect(navigationMock.redirect).toHaveBeenCalledWith("https://checkout.flutterwave.com/pay/x");
  });

  it("returns the validation error without creating a row", async () => {
    const result = await initiateDonationAction(input({ amountMinor: 5 }));

    expect(result?.error).toMatch(/smallest donation/i);
    expect(prismaMock.donation.create).not.toHaveBeenCalled();
    expect(flutterwaveMock.initiateStandardPayment).not.toHaveBeenCalled();
  });
});
