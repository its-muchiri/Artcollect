import type { CSSProperties, ReactNode } from "react";
import { annotationTones, type AnnotationToneName } from "../tokens";
import { cn } from "../utils";

export interface AnnotationProps {
  children: ReactNode;
  /**
   * A curated (handwriting color × sticky-note backing) pairing from
   * `tokens.ts`. Arbitrary color combos are deliberately impossible via
   * the API — every pairing here is test-enforced at WCAG AA (4.5:1).
   */
  tone?: AnnotationToneName;
  /** Rotation in degrees; defaults to the tone's built-in tilt. */
  rotate?: number;
  /** Adds a strip of tape over the note's top edge. */
  withTape?: boolean;
  className?: string;
}

/**
 * Handwritten margin note: Caveat (via the app-provided `--font-hand`
 * variable) rendered on a rotated solid sticky-note backing shape.
 *
 * This is the ONLY sanctioned way handwritten text appears in the v2
 * system — the backing shape is what keeps it legible (contrast-tested)
 * on both paper and photo backgrounds.
 */
export function Annotation({ children, tone = "marker", rotate, withTape = false, className }: AnnotationProps) {
  const t = annotationTones[tone];

  const style: CSSProperties = {
    fontFamily: "var(--font-hand), 'Segoe Script', 'Bradley Hand', cursive",
    color: t.text,
    backgroundColor: t.backing,
    rotate: `${rotate ?? t.rotate}deg`,
  };

  return (
    <span
      className={cn(
        "relative inline-block px-3 py-1 leading-snug",
        "shadow-[2px_3px_0_rgba(22,19,17,0.18)]",
        className,
      )}
      style={style}
      data-annotation-tone={tone}
    >
      {withTape && (
        <span
          aria-hidden="true"
          className="absolute -top-2.5 left-1/2 block h-4 w-14 -translate-x-1/2 rotate-[-3deg] bg-white/60 shadow-sm"
        />
      )}
      {children}
    </span>
  );
}
