import { describe, expect, it } from "vitest";
import { computeCauseProgress } from "../index";

/**
 * Shared donation-progress math (both platforms render cause progress
 * from this one function — TikoYetu's donate pages and ArtCollect's
 * editorial causes page must never disagree).
 */
describe("computeCauseProgress", () => {
  it("returns 0 for a cause with no goal (never divides by zero)", () => {
    expect(computeCauseProgress(0, 0)).toBe(0);
    expect(computeCauseProgress(5000, 0)).toBe(0);
    expect(computeCauseProgress(5000, -1)).toBe(0);
  });

  it("returns 0 when nothing has been raised", () => {
    expect(computeCauseProgress(0, 100000)).toBe(0);
    expect(computeCauseProgress(-5, 100000)).toBe(0);
  });

  it("rounds to whole percent", () => {
    expect(computeCauseProgress(1, 3)).toBe(33);
    expect(computeCauseProgress(2, 3)).toBe(67);
  });

  it("caps at 100 even when the goal is exceeded", () => {
    expect(computeCauseProgress(150000, 100000)).toBe(100);
    expect(computeCauseProgress(100000000, 1)).toBe(100);
  });

  it("hits the boundary exactly at goal", () => {
    expect(computeCauseProgress(100000, 100000)).toBe(100);
  });

  it("matches the seeded demo progress", () => {
    // Kibera Walls Fund: ~30,400 of 500,000 KES.
    expect(computeCauseProgress(3040000, 50000000)).toBe(6);
  });
});
