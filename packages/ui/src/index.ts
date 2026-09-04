/**
 * @artcollect/ui — the v2 maximalist design system's shared package.
 *
 * Consumed by both apps (transpiled from TS source via `transpilePackages`,
 * tokens imported from `@artcollect/ui/tokens.css`). See
 * docs/11_maximalist_redesign_plan.md.
 */
export { Annotation, type AnnotationProps } from "./scrap/Annotation";
export { HighlighterMark, type HighlighterMarkProps } from "./scrap/HighlighterMark";
export { StapleMark, type StapleMarkProps } from "./scrap/StapleMark";
export { TapePiece, type TapePieceProps } from "./scrap/TapePiece";
export { TornEdge, type TornEdgeProps } from "./scrap/TornEdge";
export { PixelSprite, spriteToRects, type PixelGrid, type PixelRect, type PixelSpriteProps } from "./pixel/PixelSprite";
export { usePrefersReducedMotion, prefersReducedMotion } from "./motion/usePrefersReducedMotion";
export {
  contrastRatio,
  hexToRgb,
  passesAA,
  relativeLuminance,
  WCAG_AA_NORMAL_TEXT,
  type Rgb,
} from "./contrast";
export { annotationTones, palette, type AnnotationToneName, type PaletteKey } from "./tokens";
export { cn } from "./utils";
