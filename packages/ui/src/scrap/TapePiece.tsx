"use client";

import { useId } from "react";
import { cn } from "../utils";

export interface TapePieceProps {
  /** `clear` = translucent glossy tape; `manila` = opaque paper tape. */
  tone?: "clear" | "manila";
  /** Rotation in degrees. */
  angle?: number;
  className?: string;
}

const TONE_GRADIENTS: Record<"clear" | "manila", { from: string; mid: string; to: string }> = {
  clear: { from: "rgba(255,255,255,0.72)", mid: "rgba(255,255,255,0.45)", to: "rgba(250,247,238,0.62)" },
  manila: { from: "rgba(232,213,163,0.92)", mid: "rgba(221,199,142,0.88)", to: "rgba(238,222,180,0.92)" },
};

/**
 * A strip of sticky tape, rendered as displaced-edge SVG — how every
 * collage gets physically "attached". Absolutely positioned by default:
 * drop it inside any `relative` parent and place with utility classes
 * (`-top-3 left-8`, …). Purely decorative — always `aria-hidden`.
 */
export function TapePiece({ tone = "clear", angle = -4, className }: TapePieceProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `tape-f-${rawId}`;
  const gradientId = `tape-g-${rawId}`;
  const gradient = TONE_GRADIENTS[tone];

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute block h-7 w-24", className)}
      style={{ rotate: `${angle}deg` }}
    >
      <svg width="100%" height="100%" preserveAspectRatio="none">
        <defs>
          {/* Rough cut ends: high horizontal frequency nibbles the left/right
              edges much more than the top/bottom. */}
          <filter id={filterId} x="-15%" y="-30%" width="130%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.35 0.06"
              numOctaves={2}
              seed={11}
              result="rough"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="rough"
              scale={7}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradient.from} />
            <stop offset="50%" stopColor={gradient.mid} />
            <stop offset="100%" stopColor={gradient.to} />
          </linearGradient>
        </defs>
        <rect
          x="3%"
          y="10%"
          width="94%"
          height="80%"
          fill={`url(#${gradientId})`}
          stroke="rgba(22,19,17,0.08)"
          strokeWidth="1"
          filter={`url(#${filterId})`}
        />
      </svg>
    </span>
  );
}
