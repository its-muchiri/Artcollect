/**
 * Opaque ticket tokens.
 *
 * Per docs/07_payments_and_security.md: QR tokens must be high-entropy,
 * non-sequential, and revocable, and only a hash/reference should be
 * stored where feasible. The pattern here is the standard one for any
 * bearer credential (API keys, session tokens): generate 256 bits of
 * randomness, hand the raw value to the holder exactly once, and persist
 * only its SHA-256 hash (`Ticket.qrTokenHash`, unique). Validation is a
 * hash lookup — nothing about the ticket (id, event, attendee) is ever
 * encoded in or recoverable from the token itself.
 */
import "server-only";
import { createHash, randomBytes } from "node:crypto";

export interface TicketToken {
  /** The raw bearer value — goes into the QR image and the wallet URL. Never stored. */
  token: string;
  /** SHA-256 hex digest of `token` — this is what gets persisted on `Ticket.qrTokenHash`. */
  tokenHash: string;
}

export function generateTicketToken(): TicketToken {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashTicketToken(token) };
}

export function hashTicketToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
