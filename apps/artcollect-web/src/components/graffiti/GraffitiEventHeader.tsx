"use client";

import dynamic from "next/dynamic";

/**
 * Code-split boundary for the graffiti treatment (docs/11 Phase 6).
 *
 * The event page renders this only when `getEventStyle` resolves the
 * event's `category` to "graffiti" — so art/editorial/other event pages
 * never fetch the spray-filter bundle. The headline itself is SSR-safe;
 * the split exists for the bundle, not the server.
 */
const GraffitiHeadline = dynamic(() => import("./GraffitiHeadline"));

export function GraffitiEventHeader({
  active,
  title,
  sticker,
}: {
  active: boolean;
  title: string;
  sticker?: string;
}) {
  if (!active) return null;
  return <GraffitiHeadline title={title.toUpperCase()} sticker={sticker} />;
}
