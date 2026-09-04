import { describe, expect, it } from "vitest";
import { interleaveShowcaseSeeds, showcaseKindLabel, AVAILABILITY_LABEL, type ShowcaseSeed } from "../showcase";

/**
 * The Main Wall's pure ordering logic: art → event → cause round-robin,
 * capped, resilient to empty groups.
 */
function seed(kind: ShowcaseSeed["kind"], key: string): ShowcaseSeed {
  return { key, kind, title: `t-${key}`, subtitle: "s", image: null, imageAlt: "alt", href: "/" };
}

describe("interleaveShowcaseSeeds", () => {
  it("round-robins art → event → cause", () => {
    const out = interleaveShowcaseSeeds({
      art: [seed("art", "a1"), seed("art", "a2")],
      events: [seed("event", "e1"), seed("event", "e2")],
      causes: [seed("cause", "c1"), seed("cause", "c2")],
    });

    expect(out.map((s) => s.kind)).toEqual([
      "art", "event", "cause",
      "art", "event", "cause",
    ]);
  });

  it("caps the strip length", () => {
    const out = interleaveShowcaseSeeds(
      {
        art: [seed("art", "a1"), seed("art", "a2"), seed("art", "a3")],
        events: [seed("event", "e1")],
        causes: [seed("cause", "c1")],
      },
      4,
    );
    expect(out).toHaveLength(4);
  });

  it("survives empty groups without breaking the rotation", () => {
    const out = interleaveShowcaseSeeds({ art: [seed("art", "a1")], events: [], causes: [] });
    expect(out.map((s) => s.kind)).toEqual(["art"]);

    const out2 = interleaveShowcaseSeeds({ art: [], events: [seed("event", "e1")], causes: [seed("cause", "c1")] });
    expect(out2.map((s) => s.kind)).toEqual(["event", "cause"]);
  });

  it("returns an empty strip when everything is empty", () => {
    expect(interleaveShowcaseSeeds({ art: [], events: [], causes: [] })).toEqual([]);
  });
});

describe("labels", () => {
  it("labels the three kinds", () => {
    expect(showcaseKindLabel("art")).toBe("ART");
    expect(showcaseKindLabel("event")).toBe("EVENT");
    expect(showcaseKindLabel("cause")).toBe("CAUSE");
  });

  it("maps every availability bucket to plain accessible text", () => {
    expect(AVAILABILITY_LABEL.available).toMatch(/available/i);
    expect(AVAILABILITY_LABEL.low).toMatch(/fast/i);
    expect(AVAILABILITY_LABEL.sold_out).toMatch(/sold out/i);
    expect(AVAILABILITY_LABEL.closed).toMatch(/closed/i);
  });
});
