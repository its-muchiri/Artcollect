import { notFound } from "next/navigation";
import { Calendar, MapPin } from "lucide-react";
import { deriveCtaState } from "@artcollect/contracts";
import { Annotation } from "@artcollect/ui";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TicketTierSelector } from "@/components/TicketTierSelector";
import { PixelAvailabilityMark } from "@/components/pixel/PixelAvailabilityMark";
import { GraffitiEventHeader } from "@/components/graffiti/GraffitiEventHeader";
import { getEventStyle } from "@/lib/event-style";
import { getEventBySlug } from "@/lib/ticketing-events";
import { formatEventDate } from "@/lib/format";

// No generateStaticParams, and rendering forced dynamic: ticket
// availability changes continuously, so this route is intentionally never
// statically pre-generated or cached, which would risk serving stale
// availability.
export const dynamic = "force-dynamic";

const CTA_COPY: Record<string, string> = {
  on_sale: "Tickets on sale",
  low_availability: "Selling fast",
  sold_out: "Sold out",
  upcoming: "Sales open soon",
  sales_closed: "Sales closed",
  cancelled: "Event cancelled",
  status_unknown: "Checking availability…",
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  // Demonstrates the shared `@artcollect/contracts` CTA-state logic on the
  // TikoYetu side — the same `deriveCtaState` an ArtCollect event page would
  // call after reading this event's status over the cross-platform API.
  const ctaState = deriveCtaState(event.status, event.availability);

  // Style routing (docs/11 Phase 1/6): streetart/music/nightlife events
  // resolve to "graffiti" — Phase 6's code-split headline/stickers hang
  // off exactly this switch; every other category stays the calm default.
  const style = getEventStyle(event.category);
  const isGraffiti = style === "graffiti";

  return (
    <>
      <Header />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
          {event.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element -- external, unoptimized editorial imagery
            <img
              src={event.coverImage}
              alt={event.title}
              className="h-72 w-full object-cover sm:h-96"
            />
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                {CTA_COPY[ctaState]}
              </span>
              {/* Decorative pixel reinforcement of the availability state —
                  the chip above carries it accessibly. */}
              <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                <PixelAvailabilityMark availability={event.availability} />
              </span>
            </div>

            {/* Graffiti pages get the code-split spray headline (with an
                sr-only h1 preserved for semantics); every other category
                keeps the calm default heading. */}
            {isGraffiti ? (
              <>
                <h1 className="sr-only">{event.title}</h1>
                <GraffitiEventHeader
                  active
                  title={event.title}
                  sticker="line up at the gate 30 min early"
                />
              </>
            ) : (
              <h1 className="mt-3 font-display text-3xl font-bold text-zinc-900 sm:text-4xl">
                {event.title}
              </h1>
            )}
            <p className="mt-1 text-zinc-500">by {event.organiser}</p>

            <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-600 sm:flex-row sm:gap-8">
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                {event.startsAt ? formatEventDate(event.startsAt) : "Date to be announced"}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                {event.venue}
                {event.city ? `, ${event.city}` : ""}
              </span>
            </div>

            {event.description && <p className="mt-6 max-w-2xl text-zinc-600">{event.description}</p>}
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <TicketTierSelector
              eventId={event.id}
              tiers={event.tiers}
              currency={event.currency}
            />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
