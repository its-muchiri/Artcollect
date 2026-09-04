/**
 * Pure WCAG contrast math.
 *
 * Exists so the v2 palette's handwriting/sticker pairings can be enforced
 * by test instead of by eye: `Annotation` tones are declared in tokens.ts
 * and `__tests__/contrast.test.ts` asserts every pairing holds AA (4.5:1).
 * No DOM, no React — safe to import from any context.
 */

export interface Rgb {
  /** 0–255. */
  r: number;
  /** 0–255. */
  g: number;
  /** 0–255. */
  b: number;
}

/** Parses `#RGB`/`#RRGGBB` (with or without the leading `#`). Throws on anything else. */
export function hexToRgb(hex: string): Rgb {
  const value = hex.trim().replace(/^#/, "");
  const expanded =
    value.length === 3
      ? value
          .split("")
          .map((c) => c + c)
          .join("")
      : value;

  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) {
    throw new Error(`Unsupported color format: "${hex}" (expected #RGB or #RRGGBB)`);
  }

  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
}

/** WCAG 2.x relative luminance of a color (linearized sRGB). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/**
 * WCAG contrast ratio between two colors (order-independent, 1–21).
 * Accepts any two parseable hex strings.
 */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(hexToRgb(fg));
  const l2 = relativeLuminance(hexToRgb(bg));
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** WCAG AA threshold for normal-size text. */
export const WCAG_AA_NORMAL_TEXT = 4.5;

export function passesAA(fg: string, bg: string): boolean {
  return contrastRatio(fg, bg) >= WCAG_AA_NORMAL_TEXT;
}
