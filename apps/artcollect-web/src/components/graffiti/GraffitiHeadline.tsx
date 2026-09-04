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
 * Layout math: Anton at `fontSize` runs ≈0.52em per uppercase character.
 * Shrink the size until the title wraps into ≤3 lines that each fit the
 * 96-unit text box; lines that still overrun get `textLength` (glyph
 * squeezing) so nothing ever clips out of the viewBox — long titles like
 * "GENESIS — 404 EFFECT FRIDAY NIGHT" wrap instead of vanishing.
 */
function layoutTitle(title: string): { lines: string[]; fontSize: number; height: number } {
  const words = title.split(/\s+/).filter(Boolean);
  const candidates = [20, 16, 13, 11, 9];

  for (const size of candidates) {
    const maxChars = Math.floor(92 / (size * 0.52));
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = candidate;
      }
      if (lines.length === 3) break;
    }
    if (lines.length < 3 && current) lines.push(current);

    if (lines.length <= 3 && words.length > 0 && lines.length > 0) {
      const lineHeight = size * 1.08;
      // 4 units top padding + lines + 8 units of drip room below.
      return { lines, fontSize: size, height: Math.ceil(4 + lines.length * lineHeight + 8) };
    }
  }

  // Degenerate fallback (single enormous word): squeeze one line.
  return { lines: [title], fontSize: 9, height: 24 };
}

function naturalWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.52;
}

/**
 * The graffiti headline (docs/11 Phase 6): the Anton poster face rendered
 * as SVG text and run through the code-driven spray filter, with drip
 * marks and a hot-pink sticker. Loaded ONLY on graffiti-category event
 * pages (streetart/music/nightlife) via the dynamic-import wrapper —
 * other event pages never fetch this bundle.
 */
export default function GraffitiHeadline({ title, sticker, className }: GraffitiHeadlineProps) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const filterId = `spray-h-${rawId}`;
  const dripId = `spray-d-${rawId}`;
  const seed = (title.length % 17) + 3;

  const { lines, fontSize, height } = layoutTitle(title.toUpperCase());
  const lineHeight = fontSize * 1.08;
  const firstBaseline = 4 + fontSize;
  const lastBaseline = firstBaseline + (lines.length - 1) * lineHeight;
  const poster = "var(--font-poster), 'Arial Narrow', Impact, sans-serif";

  // Drips fall from a few anchor points under the last line.
  const dripAnchors = lines.length > 0 ? [18, 52, 84] : [];
  const dripFloor = lastBaseline + 1.5;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 100 ${height}`}
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

        {/* Overspray shadow pass + main spray pass, per line. */}
        {lines.map((line, i) => {
          const y = firstBaseline + i * lineHeight;
          const overrun = naturalWidth(line, fontSize) > 92;
          const fit = overrun ? { textLength: 92, lengthAdjust: "spacingAndGlyphs" as const } : {};
          return (
            <g key={i}>
              <text
                x="2"
                y={y}
                fontSize={fontSize}
                fontFamily={poster}
                fill="var(--ac-hot-pink)"
                opacity="0.5"
                filter={`url(#${filterId})`}
                transform="translate(0.8 0.8)"
                {...fit}
              >
                {line}
              </text>
              <text
                x="2"
                y={y}
                fontSize={fontSize}
                fontFamily={poster}
                fill="var(--ac-ink)"
                filter={`url(#${filterId})`}
                {...fit}
              >
                {line}
              </text>
            </g>
          );
        })}

        {/* Drips */}
        <g filter={`url(#${dripId})`} opacity="0.85">
          {dripAnchors.map((x, i) => (
            <path
              key={i}
              d={`M${x} ${dripFloor} q0.6 ${2 + i} 0 ${3 + i * 1.5} t0 2`}
              stroke="var(--ac-ink)"
              strokeWidth={1.4 - i * 0.2}
              fill="none"
              strokeLinecap="round"
            />
          ))}
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
