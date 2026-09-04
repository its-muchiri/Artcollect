/**
 * Donation validation — pure rules shared by the server action (which
 * re-checks everything), the tests, and any UI that wants the limits.
 *
 * Kept OUT of the "use server" action module: Next requires server-action
 * files to export only async functions, so constants and sync helpers
 * live here.
 */

/** Donations are intentionally bounded: tiny spam and absurd amounts both rejected. */
export const MIN_DONATION_MINOR = 1000; // KES 10
export const MAX_DONATION_MINOR = 10_000_000; // KES 100,000
export const MAX_MESSAGE_LENGTH = 280;
export const MAX_NAME_LENGTH = 80;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface DonationInput {
  causeId: string;
  /** Minor units (cents). */
  amountMinor: number;
  donorEmail: string;
  donorName?: string;
  message?: string;
  anonymous?: boolean;
}

export function validateDonationInput(input: DonationInput): string | null {
  if (!Number.isInteger(input.amountMinor) || input.amountMinor < MIN_DONATION_MINOR) {
    return `The smallest donation is KES ${MIN_DONATION_MINOR / 100}.`;
  }
  if (input.amountMinor > MAX_DONATION_MINOR) {
    return `For gifts above KES ${MAX_DONATION_MINOR / 100}, please email us directly so we can receipt it properly.`;
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
