/**
 * The v2 maximalist palette — single source of truth.
 *
 * `packages/ui/tokens.css` mirrors these values as CSS custom properties
 * (`--ac-*`); the two files must stay in sync because tests (and the
 * Annotation tone pairings) compute against these hex literals, while app
 * stylesheets consume the CSS vars. Swapping a hex here and in tokens.css
 * re-themes the whole system.
 *
 * Per docs/11_maximalist_redesign_plan.md: paper + ink are the two
 * neutrals; the five accents are one per style lane — coral (collage),
 * cobalt (vector), lime (pixel), hot-pink (graffiti), marker-red
 * (handwritten).
 */
export const palette = {
  /** Warm off-white — the one canvas every section sits on. */
  paper: "#F5F1E8",
  /** Warm off-black — the one ink. */
  ink: "#161311",

  // The five accents (one per style lane).
  coral: "#E8442E", // collage
  cobalt: "#1F4FD8", // vector
  lime: "#A4C639", // pixel
  hotPink: "#E93A8F", // graffiti (spray)
  markerRed: "#B23A2E", // handwritten

  // Derived supporting tints (not new accents — lightened/neutered fills
  // of the accents above, used only as backing shapes and paper textures).
  paperDeep: "#EAE2D0",
  highlighterYellow: "#F2DF4F",
  stickerPink: "#F5C6D6",
} as const;

export type PaletteKey = keyof typeof palette;

/**
 * Curated handwriting-tone pairings for the `<Annotation>` component.
 *
 * Every entry is a (text color × sticky-note backing color) pair that must
 * hold WCAG AA (4.5:1) — enforced by `src/__tests__/contrast.test.ts` so a
 * palette swap that breaks legibility fails the build instead of shipping.
 * Arbitrary pairings are deliberately not allowed: light accent backings
 * (lime, sticker-pink) only ever pair with ink text, and colored marker
 * text only ever sits on paper/ink backings.
 */
export const annotationTones = {
  /** Marker-red handwriting on the plain paper note. */
  marker: { text: palette.markerRed, backing: palette.paper, rotate: -2 },
  /** Ink handwriting on the plain paper note. */
  ink: { text: palette.ink, backing: palette.paper, rotate: 1.5 },
  /** Cobalt handwriting on the plain paper note. */
  cobalt: { text: palette.cobalt, backing: palette.paper, rotate: -1 },
  /** Ink handwriting on a highlighter-yellow swipe. */
  highlight: { text: palette.ink, backing: palette.highlighterYellow, rotate: -1.5 },
  /** Ink handwriting on a lime sticky note (pixel-lane accent as backing). */
  lime: { text: palette.ink, backing: palette.lime, rotate: 2 },
  /** Ink handwriting on a pink sticky note (graffiti-lane tint as backing). */
  pink: { text: palette.ink, backing: palette.stickerPink, rotate: -2.5 },
  /** Paper handwriting on an ink note — the "label on the dark scrap" tone. */
  night: { text: palette.paper, backing: palette.ink, rotate: 1 },
  /** Lime handwriting on an ink note — pixel accent on the dark scrap. */
  neon: { text: palette.lime, backing: palette.ink, rotate: -1 },
  /** Hot-pink handwriting on an ink note — graffiti accent on the dark scrap. */
  spray: { text: palette.hotPink, backing: palette.ink, rotate: 2.5 },
} as const;

export type AnnotationToneName = keyof typeof annotationTones;
