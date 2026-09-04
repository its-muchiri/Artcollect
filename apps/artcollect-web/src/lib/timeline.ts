import "server-only";
import { listPublishedEvents } from "@/lib/events";
import { listAuctions, type AuctionStatus } from "@/lib/auctions";

/**
 * The merged events + art-sales timeline (tickets from `Event`/
 * `TicketingEventLink`, auctions from `ArtworkAuction`): one chronological
 * feed, sorted by each entry's start date. Ticket entries link into the
 * `(tickets)` route group same as everywhere else on the site; auction
 * entries link to the artist's profile, since there's no standalone
 * artwork page yet.
 */

export type TimelineKind = "event" | "auction";
export type TimelineStatus = "upcoming" | "past" | AuctionStatus;

export interface TimelineEntry {
  kind: TimelineKind;
  id: string;
  /** Primary sort date — an event's start time, or an auction's launch time. */
  date: string;
  /** Auctions only: when the window closes. */
  endDate: string | null;
  title: string;
  subtitle: string;
  href: string;
  image: string | null;
  status: TimelineStatus;
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  const [events, auctions] = await Promise.all([listPublishedEvents(), listAuctions()]);
  const now = Date.now();

  const eventEntries: TimelineEntry[] = events
    .filter((event): event is typeof event & { startsAt: string } => event.startsAt !== null)
    .map((event) => ({
      kind: "event",
      id: event.id,
      date: event.startsAt,
      endDate: null,
      title: event.title,
      subtitle: event.venue || "Venue to be announced",
      href: event.ticketingPath ?? "/events",
      image: event.coverImage,
      status: new Date(event.startsAt).getTime() < now ? "past" : "upcoming",
    }));

  const auctionEntries: TimelineEntry[] = auctions.map((auction) => ({
    kind: "auction",
    id: auction.id,
    date: auction.startsAt,
    endDate: auction.endsAt,
    title: auction.artworkTitle,
    subtitle: `${auction.artistName} · original`,
    href: `/artists/${auction.artistSlug}`,
    image: auction.image,
    status: auction.status,
  }));

  return [...eventEntries, ...auctionEntries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}
