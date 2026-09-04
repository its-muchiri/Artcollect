import "server-only";
import { prisma } from "@artcollect/database";

/**
 * ArtCollect editorial events (docs/11 Phase 3): published ArtCollect
 * events with their canonical TikoYetu link row when one exists. The CTA
 * never computes ticket state itself — it hands off to TikoYetu's event
 * page, which owns the live availability read (docs/08).
 */

export interface ArtEventCard {
  id: string;
  slug: string;
  title: string;
  venue: string;
  startsAt: string | null;
  coverImage: string | null;
  /**
   * Present only when the cross-platform link row exists. An in-app path
   * (`/events/{ticketing-slug}`), not `TicketingEventLink.checkoutUrl` —
   * that field held a full external URL back when ArtCollect and TikoYetu
   * were separately-deployed apps (docs/08); now that ticketing lives in
   * this same app's `(tickets)` route group, the hand-off is an internal
   * `<Link>`, not a cross-domain anchor. `checkoutUrl` itself is unused
   * here now but left on the schema — still meaningful bookkeeping of
   * when/whether the link was established.
   */
  ticketingPath: string | null;
}

export async function listPublishedEvents(): Promise<ArtEventCard[]> {
  const events = await prisma.event.findMany({
    where: { status: "published" },
    include: { ticketingLink: { include: { ticketingEvent: true } } },
    orderBy: { startsAt: "asc" },
  });

  return events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    venue: event.venue ?? "",
    startsAt: event.startsAt?.toISOString() ?? null,
    coverImage: event.coverImageKey,
    ticketingPath: event.ticketingLink ? `/events/${event.ticketingLink.ticketingEvent.slug}` : null,
  }));
}
