import { cn } from "../utils";

export interface StapleMarkProps {
  /** Rotation in degrees — staples are never quite straight. */
  angle?: number;
  className?: string;
}

/**
 * A small staple mark — the third way (after tape and tears) collage
 * elements get attached. Stroke-based SVG in `currentColor`; purely
 * decorative, always `aria-hidden`.
 */
export function StapleMark({ angle = -8, className }: StapleMarkProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 12"
      className={cn("block h-3 w-6 text-ink", className)}
      style={{ rotate: `${angle}deg` }}
    >
      {/* Two legs and a slightly skewed bridge, round-capped like real wire. */}
      <path
        d="M4.5 3.2 L20 2.2 M4.5 3.2 V10 M20 2.2 V9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
