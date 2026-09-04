/**
 * Event category → visual style routing (docs/11 Phase 1/6).
 *
 * Every TikoYetu event page picks exactly one visual style off the event's
 * `category` field: street-art/music/nightlife events get the graffiti
 * treatment (code-split so only those pages ever load the texture-filter
 * bundle); every other category — and any unrecognized value — gets the
 * calm default surface. There is no "unstyled" or crashing state, ever.
 *
 * This module is deliberately dependency-free (no Prisma import) so client
 * components can use it without pulling server code into the browser.
 * `TICKETING_EVENT_CATEGORIES` must mirror the `TicketingEventCategory`
 * Prisma enum — pinned by `__tests__/event-style.test.ts`.
 */

export const TICKETING_EVENT_CATEGORIES = [
  "art",
  "music",
  "nightlife",
  "streetart",
  "editorial",
  "other",
] as const;

export type TicketingEventCategoryName = (typeof TICKETING_EVENT_CATEGORIES)[number];

export type EventVisualStyle = "graffiti" | "default";

const CATEGORY_STYLES: Record<TicketingEventCategoryName, EventVisualStyle> = {
  art: "default",
  music: "graffiti",
  nightlife: "graffiti",
  streetart: "graffiti",
  editorial: "default",
  other: "default",
};

/**
 * Resolves an event's visual style. Accepts a plain string (the shape that
 * crosses API/DB boundaries) and falls back explicitly to `"default"` for
 * null/undefined/unknown values — tested, never an unstyled state.
 */
export function getEventStyle(category: string | null | undefined): EventVisualStyle {
  if (!category) return "default";
  if (!Object.prototype.hasOwnProperty.call(CATEGORY_STYLES, category)) return "default";
  return CATEGORY_STYLES[category as TicketingEventCategoryName];
}

export function isGraffitiStyle(style: EventVisualStyle): boolean {
  return style === "graffiti";
}
