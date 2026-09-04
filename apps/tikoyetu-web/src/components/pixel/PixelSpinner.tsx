"use client";

import { PixelSprite } from "@artcollect/ui";
import { SPINNER_GLASS } from "./sprites";

/**
 * Code-generated pixel loading spinner (docs/11 Phase 5): a single sprite
 * rotated in DISCRETE 90° steps (`steps()` timing, no easing) so the
 * motion itself reads as pixel art. Functional status indicator only —
 * always paired with plain text; never imported by checkout surfaces
 * (eslint-enforced).
 */
export function PixelSpinner({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-block ${className ?? ""}`}>
      <span className="block [animation:pixel-spin_1.2s_steps(4,end)_infinite] motion-reduce:[animation:none]">
        <PixelSprite grid={SPINNER_GLASS} pixelSize={3} />
      </span>
      <style>{`@keyframes pixel-spin { to { transform: rotate(360deg); } }`}</style>
    </span>
  );
}
