import { PixelSprite } from "@artcollect/ui";
import { LAST_FEW_ZAP, SOLD_OUT_STAMP, TICKET_BADGE } from "./sprites";

/**
 * Pixel availability marks (docs/11 Phase 5): decorative pixel stamps that
 * REINFORCE — never replace — the plain-text availability chip required by
 * docs/11's non-negotiables ("price/date/ticket-status info is never
 * conveyed by pixel-art/graffiti type alone — always paired with plain
 * accessible text").
 */
export function PixelAvailabilityMark({
  availability,
}: {
  availability: "available" | "low" | "sold_out" | "closed";
}) {
  if (availability === "sold_out") {
    return <PixelSprite grid={SOLD_OUT_STAMP} pixelSize={4} className="inline-block" />;
  }
  if (availability === "low") {
    return <PixelSprite grid={LAST_FEW_ZAP} pixelSize={4} className="inline-block" />;
  }
  if (availability === "available") {
    return <PixelSprite grid={TICKET_BADGE} pixelSize={4} className="inline-block" />;
  }
  return null;
}
