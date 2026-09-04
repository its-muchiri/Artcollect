"use client";

import { useId, type SVGProps } from "react";
import { cn } from "../utils";

export interface TornEdgeProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /** Turbulence seed — different seeds give differently-shaped tears. */
  seed?: number;
  /** Roughness of the tear: `feDisplacementMap` scale in px. */
  intensity?: number;
}

/**
 * A torn-paper scrap strip — the collage system's divider/backing primitive.
 *
 * The ragged edge is generated in-code (`feTurbulence` + `feDisplacementMap`)
 * so the scrap library ships zero texture files. Color comes from
 * `currentColor`: set it with any text-color utility (`text-coral`,
 * `text-ink`, …) and the tear picks it up. Purely decorative — always
 * `aria-hidden`.
 */
export function TornEdge({ seed = 7, intensity = 12, className, ...svg }: TornEdgeProps) {
  const filterId = `torn-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      className={cn("block h-5 w-full text-coral", className)}
      {...svg}
    >
      <defs>
        {/* Horizontal-stretched fractal noise displaces the rect's edges
            into an organic tear; the rect is inset vertically so the
            displaced edge never clips outside the viewBox. */}
        <filter id={filterId} x="-10%" y="-60%" width="120%" height="220%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.12"
            numOctaves={4}
            seed={seed}
            result="tear"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="tear"
            scale={intensity}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <rect x="2%" y="28%" width="96%" height="44%" fill="currentColor" filter={`url(#${filterId})`} />
    </svg>
  );
}
