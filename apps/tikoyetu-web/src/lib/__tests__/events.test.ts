import { describe, expect, it } from "vitest";
import { bucketFromRemaining, deriveEventAvailability } from "../events";

/**
 * Verification-table row (docs/11): availability bucketing — the exact
 * 15%-low boundary, capacity 0, and the event-level rollup. Both functions
 * are pure and exported for this test; the server-only/prisma imports in
 * events.ts are inert under the vitest aliases.
 */
describe("bucketFromRemaining — the 15% low-availability boundary", () => {
  it("marks exactly 15% remaining as low (inclusive boundary)", () => {
    expect(bucketFromRemaining(1000, 150)).toBe("low");
  });

  it("marks one ticket above the boundary as available", () => {
    expect(bucketFromRemaining(1000, 151)).toBe("available");
  });

  it("marks one ticket below the boundary as low", () => {
    expect(bucketFromRemaining(1000, 149)).toBe("low");
  });

  it("marks a fresh tier as available", () => {
    expect(bucketFromRemaining(1000, 1000)).toBe("available");
  });

  it("marks zero remaining as sold_out", () => {
    expect(bucketFromRemaining(1000, 0)).toBe("sold_out");
  });

  it("marks negative remaining (overbooked) as sold_out, not low", () => {
    expect(bucketFromRemaining(1000, -5)).toBe("sold_out");
  });

  it("marks capacity 0 as sold_out — never divide by zero, never 'low'", () => {
    expect(bucketFromRemaining(0, 0)).toBe("sold_out");
  });

  it("small tiers: 1 of 7 left is low (14.3%), 1 of 6 left is available (16.7%), 0 of 6 is sold out", () => {
    expect(bucketFromRemaining(7, 1)).toBe("low");
    expect(bucketFromRemaining(6, 1)).toBe("available");
    expect(bucketFromRemaining(6, 0)).toBe("sold_out");
  });
});

describe("deriveEventAvailability — tier rollup", () => {
  const tier = (availability: "available" | "low" | "sold_out" | "closed") => ({ availability });

  it("a no-tier event is closed", () => {
    expect(deriveEventAvailability([])).toBe("closed");
  });

  it("all tiers sold out means the event is sold out", () => {
    expect(deriveEventAvailability([tier("sold_out"), tier("sold_out")])).toBe("sold_out");
  });

  it("any low tier makes the event low, even with others available", () => {
    expect(deriveEventAvailability([tier("available"), tier("low")])).toBe("low");
    expect(deriveEventAvailability([tier("low"), tier("sold_out")])).toBe("low");
  });

  it("otherwise available", () => {
    expect(deriveEventAvailability([tier("available"), tier("available")])).toBe("available");
  });
});
