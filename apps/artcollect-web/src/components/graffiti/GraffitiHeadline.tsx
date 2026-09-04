"use client";

import { useId } from "react";
import { Annotation } from "@artcollect/ui";
import { SprayFilterDefs } from "./SprayFilter";

export interface GraffitiHeadlineProps {
  /** The poster line — already uppercase from the event title. */
  title: string;
  /** Optional one-line sticker note (the page's single secondary accent). */
  sticker?: string;
  className?: string;
}

/**
 * The graffiti headline (docs/11 Phase 6): the Anton poster face rendered
 * as SVG text and run through the code-driven spray filter, with two
 * drip marks and a hot-pink sticker. Loaded ONLY on graffiti-category
 * event pages (streetart/music/nightlife) via the dynamic-import wrapper
 * — other event pages never fetch this bundle.
 */
export default function GraffitiHeadline({ title, sticker, className }: GraffitiHeadlineProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `spray-h-${rawId}`;
  const dripId = `spray-d-${rawId}`;
  const seed = (title.length % 17) + 3;

  return (
    <div className={className}>
      <svg
        viewBox="0 0 100 34"
        className="block h-auto w-full"
        role="img"
        aria-label={title}
      >
        <SprayFilterDefs id={filterId} roughness={5.5} seed={seed} />
        <defs>
          {/* Drips: turbulence-warped vertical streaks under the baseline. */}
          <filter id={dripId} x="-20%" y="-10%" width="140%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.04" numOctaves={2} seed={seed + 5} result="wobble" />
            <feDisplacementMap in="SourceGraphic" in2="wobble" scale={4} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>

        {/* Overspray shadow pass */}
        <text
          x="2"
          y="24"
          fontSize="20"
          fontFamily="var(--font-poster), 'Arial Narrow', Impact, sans-serif"
          fill="var(--ac-hot-pink)"
          opacity="0.5"
          filter={`url(#${filterId})`}
          transform="translate(0.8 0.8)"
        >
          {title}
        </text>
        {/* Main spray pass */}
        <text
          x="2"
          y="24"
          fontSize="20"
          fontFamily="var(--font-poster), 'Arial Narrow', Impact, sans-serif"
          fill="var(--ac-ink)"
          filter={`url(#${filterId})`}
        >
          {title}
        </text>
        {/* Drips */}
        <g filter={`url(#${dripId})`} opacity="0.85">
          <path d={`M18 25 q0.6 3 0 5 t0 4`} stroke="var(--ac-ink)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d={`M52 25 q0.6 4 0 6.5 t0 3`} stroke="var(--ac-ink)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d={`M84 25 q0.5 2.5 0 4.5`} stroke="var(--ac-ink)" strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>
      </svg>

      {sticker && (
        <div className="mt-1 inline-block -rotate-2">
          <Annotation tone="spray" className="text-base">
            {sticker}
          </Annotation>
        </div>
      )}
    </div>
  );
}
