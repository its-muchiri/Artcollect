"use client";

import { useId, type ReactNode } from "react";
import { palette } from "../tokens";
import { cn } from "../utils";

export interface HighlighterMarkProps {
  children: ReactNode;
  /** Marker ink color; defaults to the highlighter tint of the palette. */
  color?: string;
  className?: string;
}

/**
 * A highlighter swipe drawn *behind* text — the handwritten lane's way of
 * putting emphasis on otherwise-plain Inter copy. The swipe is an SVG rect
 * with turbulence-displaced ends (no texture files), the text stays
 * selectable, plain, and accessible on top.
 */
export function HighlighterMark({ children, color = palette.highlighterYellow, className }: HighlighterMarkProps) {
  const filterId = `hl-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <span className={cn("relative inline-block", className)}>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        className="absolute -inset-x-1.5 inset-y-0 h-full w-[calc(100%+0.75rem)]"
      >
        <defs>
          <filter id={filterId} x="-10%" y="-40%" width="120%" height="180%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.06 0.45"
              numOctaves={2}
              seed={4}
              result="rough"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="rough"
              scale={3.5}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
        <rect
          x="1"
          y="4.5"
          width="98"
          height="11"
          rx="1"
          fill={color}
          filter={`url(#${filterId})`}
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}
