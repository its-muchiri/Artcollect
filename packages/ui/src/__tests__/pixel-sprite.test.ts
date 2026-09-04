import { describe, expect, it } from "vitest";
import { PixelSprite, spriteToRects, type PixelGrid } from "../pixel/PixelSprite";

/**
 * Verification-table row (docs/11, extended): the pixel-sprite renderer's
 * pure core. Sprites must never silently render garbage — ragged rows and
 * unknown legend characters are build failures, not visual surprises.
 */

const grid: PixelGrid = {
  legend: { i: "#161311", l: "#A4C639" },
  rows: ["..i..", ".ill.", "iiili", ".ill.", "..i.."],
};

describe("spriteToRects", () => {
  it("emits one rect per non-transparent pixel with grid coordinates", () => {
    const rects = spriteToRects(grid);
    // 5×5 grid: 1+3+5+3+1 filled pixels across the rows.
    expect(rects).toHaveLength(13);
    expect(rects[0]).toEqual({ x: 2, y: 0, fill: "#161311" });
    expect(rects).toContainEqual({ x: 2, y: 1, fill: "#A4C639" });
  });

  it("treats '.' and space as transparent", () => {
    const rects = spriteToRects({ legend: { i: "#161311" }, rows: ["i ", ".i"] });
    expect(rects).toEqual([
      { x: 0, y: 0, fill: "#161311" },
      { x: 1, y: 1, fill: "#161311" },
    ]);
  });

  it("throws on ragged rows", () => {
    expect(() =>
      spriteToRects({ legend: { i: "#161311" }, rows: ["iii", "ii"] }),
    ).toThrow(/Ragged sprite row/);
  });

  it("throws on unknown legend characters", () => {
    expect(() =>
      spriteToRects({ legend: { i: "#161311" }, rows: ["ix"] }),
    ).toThrow(/Unknown sprite legend character: "x"/);
  });

  it("handles the empty sprite", () => {
    expect(spriteToRects({ legend: {}, rows: [] })).toEqual([]);
  });
});

describe("PixelSprite component contract", () => {
  it("is a named export paired with the pure helper", () => {
    expect(typeof PixelSprite).toBe("function");
    expect(typeof spriteToRects).toBe("function");
  });
});
