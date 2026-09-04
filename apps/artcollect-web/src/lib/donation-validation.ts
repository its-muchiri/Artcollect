/**
 * Donation validation — pure rules shared by the server action (which
 * re-checks everything), the tests, and any UI that wants the limits.
 *
 * Kept OUT of the "use server" action module: Next requires server-action
 * files to export only async functions, so constants and sync helpers
 * live here.
 */

/**
 * Donations are intentionally bounded: tiny spam and absurd amounts both
 * rejected. Bounds are currency-aware — KES and USD are the two
 * currencies any cause on this platform is actually seeded in.
 */
export const DONATION_BOUNDS_MINOR: Record<string, { min: number; max: number }> = {
  KES: { min: 50_000, max: 10_000_000 }, // KES 500 – 100,000
  USD: { min: 500, max: 1_000_000 }, // $5 – $10,000
};
const DEFAULT_BOUNDS = DONATION_BOUNDS_MINOR.KES!;

export const MAX_MESSAGE_LENGTH = 280;
export const MAX_NAME_LENGTH = 80;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DonationInput {
  causeId: string;
  /** Minor units (cents). */
  amountMinor: number;
  /** ISO currency of the cause being donated to — governs which bound applies. */
  currency?: string;
  donorEmail: string;
  donorName?: string;
  message?: string;
  anonymous?: boolean;
}

export function donationBounds(currency: string | undefined): { min: number; max: number } {
  return DONATION_BOUNDS_MINOR[(currency ?? "KES").toUpperCase()] ?? DEFAULT_BOUNDS;
}

export function validateDonationInput(input: DonationInput): string | null {
  const bounds = donationBounds(input.currency);
  const currency = (input.currency ?? "KES").toUpperCase();

  if (!Number.isInteger(input.amountMinor) || input.amountMinor < bounds.min) {
    return `The smallest donation is ${currency} ${bounds.min / 100}.`;
  }
  if (input.amountMinor > bounds.max) {
    return `For gifts above ${currency} ${bounds.max / 100}, please email us directly so we can receipt it properly.`;
  }
  if (!EMAIL_PATTERN.test(input.donorEmail)) {
    return "Enter a valid email so we can send your receipt.";
  }
  if (input.donorName && input.donorName.length > MAX_NAME_LENGTH) {
    return "Name is a little too long.";
  }
  if (input.message && input.message.length > MAX_MESSAGE_LENGTH) {
    return "Message must be 280 characters or fewer.";
  }
  return null;
}
