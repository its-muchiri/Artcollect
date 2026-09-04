/**
 * Shared pure business logic between ArtCollect's editorial event pages
 * and the ticketing section — availability bucketing, CTA-state
 * derivation, cause-progress math.
 *
 * This package used to also carry the ArtCollect <-> TikoYetu wire
 * contract (`EventLinkRequest`/`TicketingStatusResponse`/webhook schemas,
 * mirroring docs/08_cross_platform_integration.md) from when the two were
 * separately-deployed apps talking over HTTP. Since they merged into one
 * app (see docs/ plan for the conjoin work), there's no service boundary
 * left to have a wire format for — those schemas were removed as dead
 * code. `deriveCtaState` and the availability types below are still
 * genuinely useful; they're just called in-process now instead of across
 * a request/response boundary.
 */
import { z } from "zod";

/**
 * Coarse remaining-ticket signal. Per docs/08: never expose raw counts
 * across the platform boundary unless a business decision explicitly
 * permits it — ArtCollect only ever renders one of these four buckets.
 */
export const TicketAvailabilityBucket = z.enum([
  "available",
  "low",
  "sold_out",
  "closed",
]);
export type TicketAvailabilityBucket = z.infer<typeof TicketAvailabilityBucket>;

export const TicketingEventStatus = z.enum([
  "draft",
  "ready",
  "on_sale",
  "sales_paused",
  "sold_out",
  "ended",
  "cancelled",
  "archived",
]);
export type TicketingEventStatus = z.infer<typeof TicketingEventStatus>;

/**
 * ArtCollect's own fallback display state when a live TikoYetu status read
 * is unavailable. Per docs/08: never claim a ticket is available without a
 * valid response — this is the explicit "we don't know right now" state.
 */
export const CtaState = z.enum([
  "unavailable",
  "upcoming",
  "on_sale",
  "low_availability",
  "sold_out",
  "sales_closed",
  "cancelled",
  "status_unknown",
]);
export type CtaState = z.infer<typeof CtaState>;

/** Derives the ArtCollect-facing CTA state from a (possibly stale/absent) TikoYetu status read. */
export function deriveCtaState(
  status: TicketingEventStatus | null,
  availability: TicketAvailabilityBucket | null,
): CtaState {
  if (!status || !availability) return "status_unknown";
  if (status === "cancelled") return "cancelled";
  if (status === "draft" || status === "ready") return "upcoming";
  if (status === "ended" || status === "archived") return "sales_closed";
  if (status === "sales_paused") return "sales_closed";
  if (status === "sold_out" || availability === "sold_out") return "sold_out";
  if (availability === "low") return "low_availability";
  return "on_sale";
}

/**
 * Donation-cause progress, shared by both the ticketing section's donate
 * pages and ArtCollect's editorial causes page, from the same database.
 * Pure: percent of goal raised,
 * capped at 100; a non-positive goal means "no goal set" and reads 0
 * rather than dividing by zero.
 */
export function computeCauseProgress(raisedMinor: number, goalMinor: number): number {
  if (goalMinor <= 0) return 0;
  if (raisedMinor >= goalMinor) return 100;
  if (raisedMinor <= 0) return 0;
  return Math.min(100, Math.round((raisedMinor / goalMinor) * 100));
}
