import { describe, expect, it } from "vitest";
import { contrastRatio, hexToRgb, passesAA, relativeLuminance, WCAG_AA_NORMAL_TEXT } from "../contrast";
import { annotationTones, palette } from "../tokens";

/**
 * The v2 system's first real test (docs/11 Phase 1): every handwriting
 * color × sticky-note backing color pairing shipped in `<Annotation>`'s
 * tone list must hold WCAG AA (4.5:1) for normal-size text — so a palette
 * swap that breaks legibility fails the build instead of shipping.
 */
describe("contrastRatio", () => {
  it("returns 21:1 for pure black on pure white", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("is order-independent", () => {
    expect(contrastRatio(palette.markerRed, palette.paper)).toBe(
      contrastRatio(palette.paper, palette.markerRed),
    );
  });

  it("identical colors give a ratio of 1", () => {
    expect(contrastRatio(palette.ink, palette.ink)).toBeCloseTo(1, 5);
  });

  it("matches WCAG reference values for known pairs", () => {
    // WCAG 2.x worked example: #767676 on #FFFFFF ≈ 4.54:1.
    expect(contrastRatio("#767676", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    // And the first failing grey one step lighter ≈ 4.35:1 — must NOT pass.
    expect(contrastRatio("#7D7D7D", "#FFFFFF")).toBeLessThan(4.5);
  });
});

describe("hexToRgb / relativeLuminance", () => {
  it("parses 3- and 6-digit hex, with or without the hash", () => {
    expect(hexToRgb("#161311")).toEqual({ r: 0x16, g: 0x13, b: 0x11 });
    expect(hexToRgb("161311")).toEqual({ r: 0x16, g: 0x13, b: 0x11 });
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("throws on unsupported formats", () => {
    expect(() => hexToRgb("not-a-color")).toThrow();
    expect(() => hexToRgb("#12345")).toThrow();
    expect(() => hexToRgb("rgb(0, 0, 0)")).toThrow();
  });

  it("computes pure-white luminance as 1 and pure-black as 0", () => {
    expect(relativeLuminance(hexToRgb("#FFFFFF"))).toBeCloseTo(1, 5);
    expect(relativeLuminance(hexToRgb("#000000"))).toBeCloseTo(0, 5);
  });
});

describe("Annotation tone pairings", () => {
  const tones = Object.entries(annotationTones);

  it("ships at least the six documented tones", () => {
    expect(tones.length).toBeGreaterThanOrEqual(6);
  });

  it.each(tones)('tone "%s" holds WCAG AA (4.5:1) for its text on its backing', (_name, tone) => {
    expect(contrastRatio(tone.text, tone.backing)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    expect(passesAA(tone.text, tone.backing)).toBe(true);
  });
});

describe("palette sanity", () => {
  it("keeps body-text-grade contrast for ink on paper and paper on ink", () => {
    expect(passesAA(palette.ink, palette.paper)).toBe(true);
    expect(passesAA(palette.paper, palette.ink)).toBe(true);
  });

  it("keeps cobalt (the only accent sanctioned as text on paper) above AA", () => {
    expect(passesAA(palette.cobalt, palette.paper)).toBe(true);
  });
});
