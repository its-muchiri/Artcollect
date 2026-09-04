import "server-only";
import { prisma, type TicketingEventStatus } from "@artcollect/database";
import type { TicketAvailabilityBucket } from "@artcollect/contracts";
import { getTierRemaining } from "@/lib/inventory";

export interface EventTierView {
  id: string;
  name: string;
  priceMinor: number;
  currency: string;
  capacity: number;
  remaining: number;
  minPerOrder: number;
  maxPerOrder: number;
  availability: TicketAvailabilityBucket;
}

export interface EventSummary {
  id: string;
  slug: string;
  title: string;
  organiser: string;
  venue: string;
  city: string | null;
  startsAt: string | null;
  coverImage: string | null;
  status: TicketingEventStatus;
  /** Content genre driving visual style routing (docs/11). */
  category: string;
  currency: string;
  lowestPriceMinor: number;
  availability: TicketAvailabilityBucket;
}

export interface EventDetail extends EventSummary {
  description: string | null;
  tiers: EventTierView[];
}

// Exported for the pure-function test suite (docs/11 verification table);
// both are pure and safe to reuse.
export function bucketFromRemaining(capacity: number, remaining: number): TicketAvailabilityBucket {
  if (remaining <= 0) return "sold_out";
  if (capacity > 0 && remaining / capacity <= 0.15) return "low";
  return "available";
}

export function deriveEventAvailability(
  tiers: Array<Pick<EventTierView, "availability">>,
): TicketAvailabilityBucket {
  if (tiers.length === 0) return "closed";
  if (tiers.every((tier) => tier.availability === "sold_out")) return "sold_out";
  if (tiers.some((tier) => tier.availability === "low")) return "low";
  return "available";
}

interface RawTier {
  id: string;
  name: string;
  priceMinor: bigint;
  currency: string;
  capacity: number;
  minPerOrder: number;
  maxPerOrder: number;
}

async function toTierView(tier: RawTier): Promise<EventTierView> {
  const remaining = await getTierRemaining(tier.id);
  return {
    id: tier.id,
    name: tier.name,
    // Minor-unit prices are always small enough to be exact as a JS
    // number; BigInt itself can't cross the Server -> Client Component
    // boundary (React Flight serialization doesn't support it).
    priceMinor: Number(tier.priceMinor),
    currency: tier.currency,
    capacity: tier.capacity,
    remaining,
    minPerOrder: tier.minPerOrder,
    maxPerOrder: tier.maxPerOrder,
    availability: bucketFromRemaining(tier.capacity, remaining),
  };
}

const VISIBLE_STATUSES: TicketingEventStatus[] = ["on_sale", "sales_paused", "sold_out"];

export async function listEvents(): Promise<EventSummary[]> {
  const events = await prisma.ticketingEvent.findMany({
    where: { status: { in: VISIBLE_STATUSES } },
    include: { organisation: true, tiers: true },
    orderBy: { startsAt: "asc" },
  });

  return Promise.all(
    events.map(async (event) => {
      const tierViews = await Promise.all(event.tiers.map(toTierView));
      return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        organiser: event.organisation.name,
        venue: event.venue,
        city: event.city,
        startsAt: event.startsAt?.toISOString() ?? null,
        coverImage: event.coverImageKey,
        status: event.status,
        category: event.category,
        currency: event.currency,
        lowestPriceMinor: tierViews.length ? Math.min(...tierViews.map((t) => t.priceMinor)) : 0,
        availability: deriveEventAvailability(tierViews),
      };
    }),
  );
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  const event = await prisma.ticketingEvent.findUnique({
    where: { slug },
    include: { organisation: true, tiers: true },
  });
  if (!event) return null;

  const tierViews = await Promise.all(event.tiers.map(toTierView));

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    organiser: event.organisation.name,
    venue: event.venue,
    city: event.city,
    startsAt: event.startsAt?.toISOString() ?? null,
    coverImage: event.coverImageKey,
    status: event.status,
    category: event.category,
    currency: event.currency,
    description: event.description,
    lowestPriceMinor: tierViews.length ? Math.min(...tierViews.map((t) => t.priceMinor)) : 0,
    availability: deriveEventAvailability(tierViews),
    tiers: tierViews,
  };
}
