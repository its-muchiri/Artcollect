/**
 * Graffiti spray texture — SVG filter stack (docs/11 Phase 6).
 *
 * The poster face (Anton, via `--font-poster`) runs through
 * feTurbulence + feDisplacementMap for edge roughness and a
 * feColorMatrix channel break for spray bleed. Fully code-driven — no
 * graffiti font, no texture files. This module is code-split: only
 * streetart/music/nightlife event pages ever load it (via the Phase 1
 * `category` field + `getEventStyle`), enforced by the dynamic-import
 * wrapper and grep-able import graph.
 */
"use client";

import { useId } from "react";

export interface SprayFilterProps {
  /** Displacement scale — how rough the spray edge is. */
  roughness?: number;
  /** Per-instance seed so two headlines never weather identically. */
  seed?: number;
}

/**
 * Renders the `<defs>` for the spray treatment and returns the filter
 * id to reference from `filter="url(#…)"`. Must be rendered inside the
 * same SVG (or a hidden SVG) as the filtered content.
 */
export function useSprayFilterId(roughness = 6, seed = 9): string {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return `spray-${rawId}-${seed}`;
}

export function SprayFilterDefs({ id, roughness = 6, seed = 9 }: { id: string } & SprayFilterProps) {
  return (
    <defs>
      <filter id={id} x="-8%" y="-15%" width="116%" height="130%">
        {/* Rough spray edge: fractal noise displaces the glyph outlines. */}
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.11 0.13"
          numOctaves={3}
          seed={seed}
          result="rough"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="rough"
          scale={roughness}
          xChannelSelector="R"
          yChannelSelector="G"
          result="sprayed"
        />
        {/* Spray bleed: push alpha out and threshold it back down, so the
            edge gains a faint halo of overspray. */}
        <feMorphology in="sprayed" operator="dilate" radius={1.6} result="halo" />
        <feColorMatrix
          in="halo"
          type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.35 0"
          result="haloFaded"
        />
        <feComposite in="haloFaded" in2="sprayed" operator="over" />
      </filter>
    </defs>
  );
}
