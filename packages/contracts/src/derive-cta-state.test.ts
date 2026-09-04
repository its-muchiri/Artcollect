import { describe, expect, it } from "vitest";
import {
  deriveCtaState,
  TicketAvailabilityBucket,
  TicketingEventStatus,
  type CtaState,
} from "../index";

/**
 * Verification-table row (docs/11): `deriveCtaState` over the full
 * status × availability matrix, including the `status_unknown` fallback.
 * ArtCollect renders ticket CTAs straight from this function, so every
 * cell here is a user-visible state.
 */
const STATUSES = TicketingEventStatus.options;
const BUCKETS = TicketAvailabilityBucket.options;

function expected(status: (typeof STATUSES)[number], availability: (typeof BUCKETS)[number]): CtaState {
  // Mirror of the documented rules, written independently of the impl so
  // the assertions below check the *spec*, not the code against itself.
  if (status === "cancelled") return "cancelled";
  if (status === "draft" || status === "ready") return "upcoming";
  if (status === "ended" || status === "archived" || status === "sales_paused") return "sales_closed";
  if (status === "sold_out") return "sold_out";
  if (availability === "sold_out") return "sold_out";
  if (availability === "low") return "low_availability";
  if (availability === "closed") return "on_sale"; // event live but has no visible tiers
  return "on_sale";
}

describe("deriveCtaState — full status × availability matrix", () => {
  it.each(STATUSES)("status %s × every availability bucket", (status) => {
    for (const availability of BUCKETS) {
      expect(deriveCtaState(status, availability)).toBe(expected(status, availability));
    }
  });

  it("maps every one of the 32 matrix cells without crashing", () => {
    expect(STATUSES.length * BUCKETS.length).toBe(32);
    for (const status of STATUSES) {
      for (const availability of BUCKETS) {
        const result = deriveCtaState(status, availability);
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("deriveCtaState — status_unknown fallback", () => {
  it("returns status_unknown when the status read is unavailable", () => {
    expect(deriveCtaState(null, "available")).toBe("status_unknown");
  });

  it("returns status_unknown when the availability read is unavailable", () => {
    expect(deriveCtaState("on_sale", null)).toBe("status_unknown");
  });

  it("returns status_unknown when both are unavailable", () => {
    expect(deriveCtaState(null, null)).toBe("status_unknown");
  });
});

describe("deriveCtaState — precedence", () => {
  it("cancelled beats sold_out availability", () => {
    expect(deriveCtaState("cancelled", "sold_out")).toBe("cancelled");
  });

  it("sold_out status beats low availability", () => {
    expect(deriveCtaState("sold_out", "low")).toBe("sold_out");
  });

  it("a live event with sold_out availability reads sold_out even when status is on_sale", () => {
    expect(deriveCtaState("on_sale", "sold_out")).toBe("sold_out");
  });
});
